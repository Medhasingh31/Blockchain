const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
const { uploadToIPFS, getFromIPFS } = require("./ipfs-service");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Load contract ABI and address
const contractABI = require("./artifacts/contracts/StudentFeedback.sol/StudentFeedback.json").abi;

// Try to load deployment info (check multiple networks)
let deploymentInfo;
let networkName;
let rpcUrl;

try {
  deploymentInfo = require("./deployments/StudentFeedback-localhost.json");
  networkName = "localhost";
  rpcUrl = "http://127.0.0.1:8545";
} catch (e) {
  try {
    deploymentInfo = require("./deployments/StudentFeedback-amoy.json");
    networkName = "amoy";
    rpcUrl = process.env.AMOY_RPC_URL;
  } catch (e2) {
    try {
      deploymentInfo = require("./deployments/StudentFeedback-hardhat.json");
      networkName = "hardhat";
      rpcUrl = "http://127.0.0.1:8545";
    } catch (e3) {
      console.error("No deployment found. Please deploy the contract first.");
      console.error("Run: npx hardhat node (in one terminal)");
      console.error("Then: npx hardhat run scripts/deploy-feedback.js --network localhost");
      process.exit(1);
    }
  }
}

const contractAddress = deploymentInfo.contractAddress;

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider(rpcUrl);
const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract instance
const contract = new ethers.Contract(contractAddress, contractABI, adminWallet);

// POST /submit-feedback
app.post("/submit-feedback", async (req, res) => {
  try {
    const { feedbackText, courseId, studentId, studentPrivateKey } = req.body;

    if (!feedbackText || !courseId) {
      return res.status(400).json({ error: "feedbackText and courseId are required" });
    }

    // Build IPFS content — include studentId so it's retrievable later
    const ipfsContent = JSON.stringify({
      studentId: studentId || "Anonymous",
      courseId,
      feedbackText,
      submittedAt: new Date().toISOString(),
    });

    // Step 1: Upload to IPFS
    console.log("Uploading feedback to IPFS...");
    const ipfsHash = await uploadToIPFS(ipfsContent, `feedback-${courseId}-${Date.now()}.json`);
    console.log("IPFS Hash:", ipfsHash);

    // Step 2: Submit to blockchain
    const studentWallet = studentPrivateKey
      ? new ethers.Wallet(studentPrivateKey, provider)
      : adminWallet;

    const studentContract = contract.connect(studentWallet);

    console.log("Submitting to blockchain...");
    const tx = await studentContract.submitFeedback(ipfsHash, courseId);
    const receipt = await tx.wait();

    const feedbackCounter = await contract.feedbackCounter();

    res.json({
      success: true,
      transactionHash: receipt.hash,
      feedbackId: feedbackCounter.toString(),
      ipfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      student: studentWallet.address,
      studentId: studentId || "Anonymous",
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /update-status
app.post("/update-status", async (req, res) => {
  try {
    const { feedbackId, status } = req.body;

    if (!feedbackId || !status) {
      return res.status(400).json({ error: "feedbackId and status are required" });
    }

    const tx = await contract.updateStatus(feedbackId, status);
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash,
      feedbackId,
      newStatus: status,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /feedback/:id
app.get("/feedback/:id", async (req, res) => {
  try {
    const feedbackId = req.params.id;

    const feedback = await contract.getFeedback(feedbackId);

    // Fetch content from IPFS and parse studentId
    let feedbackContent = null;
    let studentId = null;
    try {
      const raw = await getFromIPFS(feedback.ipfsHash);
      // Try parsing as JSON (new format), fallback to plain text (old format)
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        feedbackContent = parsed.feedbackText || parsed;
        studentId = parsed.studentId || null;
      } catch {
        feedbackContent = raw;
      }
    } catch (e) {
      console.log("Could not fetch IPFS content:", e.message);
    }

    res.json({
      success: true,
      feedback: {
        id: feedback.id.toString(),
        ipfsHash: feedback.ipfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${feedback.ipfsHash}`,
        feedbackContent,
        studentId,
        student: feedback.student,
        courseId: feedback.courseId,
        status: feedback.status,
        timestamp: new Date(Number(feedback.timestamp) * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /feedback - Get all feedback
app.get("/feedback", async (req, res) => {
  try {
    const allFeedback = await contract.getAllFeedback();

    // Parse studentId from IPFS content for each feedback
    const formattedFeedback = await Promise.all(allFeedback.map(async (fb) => {
      let studentId = null;
      try {
        const raw = await getFromIPFS(fb.ipfsHash);
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        studentId = parsed.studentId || null;
      } catch {}

      return {
        id: fb.id.toString(),
        ipfsHash: fb.ipfsHash,
        student: fb.student,
        studentId,
        courseId: fb.courseId,
        status: fb.status,
        timestamp: new Date(Number(fb.timestamp) * 1000).toISOString(),
      };
    }));

    res.json({
      success: true,
      count: formattedFeedback.length,
      feedback: formattedFeedback,
    });
  } catch (error) {
    console.error("Error fetching all feedback:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", contract: contractAddress });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Network: ${networkName}`);
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Admin address: ${adminWallet.address}`);
});
