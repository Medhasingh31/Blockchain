const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_JWT = process.env.PINATA_JWT;

/**
 * Upload text content to IPFS via Pinata
 * @param {string} text - The feedback text to upload
 * @param {string} fileName - Optional file name (default: feedback.txt)
 * @returns {Promise<string>} - IPFS hash (CID)
 */
async function uploadToIPFS(text, fileName = "feedback.txt") {
  try {
    const formData = new FormData();
    formData.append("file", Buffer.from(text), fileName);

    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        type: "student-feedback",
        timestamp: new Date().toISOString(),
      },
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    // Use JWT if available, otherwise use API keys
    const headers = PINATA_JWT
      ? {
          Authorization: `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders(),
        }
      : {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
          ...formData.getHeaders(),
        };

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: headers,
      }
    );

    console.log("IPFS Upload Success:", response.data.IpfsHash);
    return response.data.IpfsHash;
  } catch (error) {
    console.error("IPFS Upload Error:", error.response?.data || error.message);
    throw new Error("Failed to upload to IPFS: " + (error.response?.data?.error || error.message));
  }
}

/**
 * Retrieve content from IPFS
 * @param {string} ipfsHash - The IPFS hash (CID)
 * @returns {Promise<string>} - The content
 */
async function getFromIPFS(ipfsHash) {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    return response.data;
  } catch (error) {
    console.error("IPFS Retrieval Error:", error.message);
    throw new Error("Failed to retrieve from IPFS");
  }
}

module.exports = {
  uploadToIPFS,
  getFromIPFS,
};
