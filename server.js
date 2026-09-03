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
    const {
      feedbackText,
      courseId,
      studentId,
      studentPrivateKey,
      facultyName,
      semester,
      rating,
      category,
      isAnonymous,
      walletAddress,
      network,
      timestamp,
      status
    } = req.body;

    if (!feedbackText || !courseId) {
      return res.status(400).json({ error: "feedbackText and courseId are required" });
    }

    // Build IPFS content — include ALL fields for complete data consistency
    const ipfsContent = JSON.stringify({
      studentId: studentId || "Anonymous",
      courseId,
      feedbackText,
      facultyName: facultyName || "Not provided",
      semester: semester || "Not provided",
      rating: rating || 0,
      category: category || "Other",
      isAnonymous: isAnonymous || false,
      walletAddress: walletAddress || "Not provided",
      network: network || "localhost",
      timestamp: timestamp || new Date().toISOString(),
      status: status || "Pending",
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
      facultyName: facultyName || "Not provided",
      semester: semester || "Not provided",
      rating: rating || 0,
      category: category || "Other",
      isAnonymous: isAnonymous || false,
      network: network || "localhost",
      status: status || "Pending"
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

    // Fetch full content from IPFS with ALL fields
    let ipfsData = {
      studentId: null,
      feedbackText: null,
      facultyName: null,
      semester: null,
      rating: null,
      category: null,
      isAnonymous: null,
      walletAddress: null,
      network: null,
      status: null
    };
    
    try {
      const raw = await getFromIPFS(feedback.ipfsHash);
      const parsed = (typeof raw === 'object' && raw !== null) ? raw : JSON.parse(raw);
      ipfsData = { ...ipfsData, ...parsed };
      console.log(`Detail fetch - ID: ${feedbackId}, data:`, Object.keys(ipfsData));
    } catch (e) {
      console.log("Could not fetch IPFS content:", e.message);
    }

    // Get transaction hash (from latest transaction for this feedback)
    let transactionHash = null;
    try {
      const txReceipt = await provider.getTransactionReceipt(feedback.transactionHash || '');
      if (txReceipt) transactionHash = txReceipt.hash;
    } catch (e) {
      console.log("Could not fetch transaction hash");
    }

    res.json({
      success: true,
      feedback: {
        id: feedback.id.toString(),
        ipfsHash: feedback.ipfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${feedback.ipfsHash}`,
        transactionHash: feedback.transactionHash || 'N/A',
        student: feedback.student,
        courseId: feedback.courseId,
        status: feedback.status,
        timestamp: new Date(Number(feedback.timestamp) * 1000).toISOString(),
        // Fields from IPFS
        studentId: ipfsData.studentId,
        feedbackText: ipfsData.feedbackText,
        facultyName: ipfsData.facultyName,
        semester: ipfsData.semester,
        rating: ipfsData.rating,
        category: ipfsData.category,
        isAnonymous: ipfsData.isAnonymous,
        walletAddress: ipfsData.walletAddress,
        network: ipfsData.network
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

    // Fetch full data from IPFS for each feedback in parallel
    const formattedFeedback = await Promise.all(allFeedback.map(async (fb) => {
      let ipfsData = {
        studentId: null,
        feedbackText: null,
        facultyName: null,
        semester: null,
        rating: null,
        category: null,
        isAnonymous: null,
        walletAddress: null,
        network: null,
        status: null
      };
      
      try {
        const raw = await getFromIPFS(fb.ipfsHash);
        const parsed = (typeof raw === 'object' && raw !== null) ? raw : JSON.parse(raw);
        ipfsData = { ...ipfsData, ...parsed };
        console.log(`Feedback #${fb.id} - complete data fetched from IPFS`);
      } catch (e) {
        console.log(`Could not parse IPFS for feedback #${fb.id}:`, e.message);
      }

      return {
        id: fb.id.toString(),
        ipfsHash: fb.ipfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${fb.ipfsHash}`,
        transactionHash: fb.transactionHash || 'N/A',
        student: fb.student,
        courseId: fb.courseId,
        status: fb.status,
        timestamp: new Date(Number(fb.timestamp) * 1000).toISOString(),
        // Fields from IPFS
        studentId: ipfsData.studentId,
        feedbackText: ipfsData.feedbackText,
        facultyName: ipfsData.facultyName,
        semester: ipfsData.semester,
        rating: ipfsData.rating,
        category: ipfsData.category,
        isAnonymous: ipfsData.isAnonymous,
        walletAddress: ipfsData.walletAddress,
        network: ipfsData.network
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
