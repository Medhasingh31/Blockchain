# FeedChain - Decentralized Student Feedback System

A blockchain-based student feedback system where feedback is stored permanently on-chain and content is pinned on IPFS via Pinata. Built with Solidity, Hardhat, Node.js, and React.

---

## Tech Stack

### Blockchain
- Solidity ^0.8.0
- Hardhat
- Ethers.js v6
- Polygon Amoy Testnet (or local Hardhat network)

### Backend
- Node.js
- Express.js
- Ethers.js
- Pinata (IPFS storage)
- dotenv

### Frontend
- React 19 (Vite)
- Tailwind CSS v3
- Axios

---

## Project Structure

```
blockchain/
├── contracts/
│   └── StudentFeedback.sol       # Smart contract
├── scripts/
│   ├── deploy.js                 # Generic deploy script
│   └── deploy-feedback.js        # StudentFeedback deploy script
├── test/
│   └── Lock.test.js
├── deployments/                  # Auto-generated deployment info (JSON)
├── artifacts/                    # Auto-generated contract ABI
├── frontend/
│   └── src/
│       ├── App.jsx               # Main app with navbar + sidebar
│       └── components/
│           ├── SubmitFeedback.jsx
│           ├── ViewFeedback.jsx
│           └── AdminDashboard.jsx
├── server.js                     # Express backend
├── ipfs-service.js               # Pinata IPFS upload/fetch
├── test-api.js                   # API test script
├── test-ipfs.js                  # IPFS test script
├── hardhat.config.js
├── .env
└── package.json
```

---

## Smart Contract

**Contract:** `StudentFeedback.sol`

### Struct
```solidity
struct Feedback {
    uint id;
    string ipfsHash;
    address student;
    string courseId;
    string status;
    uint timestamp;
}
```

### Functions
| Function | Access | Description |
|---|---|---|
| `submitFeedback(ipfsHash, courseId)` | Public | Submit feedback with IPFS hash |
| `updateStatus(feedbackId, newStatus)` | Admin only | Update feedback status |
| `getFeedback(feedbackId)` | Public | Get single feedback by ID |
| `getAllFeedback()` | Public | Get all feedback |

### Events
- `FeedbackSubmitted` - emitted on new submission
- `StatusUpdated` - emitted on status change

---

## Backend API

Base URL: `http://localhost:3002`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/submit-feedback` | Upload to IPFS + store on blockchain |
| POST | `/update-status` | Admin updates feedback status |
| GET | `/feedback` | Get all feedback |
| GET | `/feedback/:id` | Get single feedback with IPFS content |
| GET | `/health` | Server health check |

### POST /submit-feedback
```json
{
  "feedbackText": "Great course!",
  "courseId": "CS101"
}
```

### POST /update-status
```json
{
  "feedbackId": 1,
  "status": "Resolved"
}
```

---

## Frontend Pages

### Submit Feedback
- Connect MetaMask wallet
- Enter Course ID and feedback text
- Uploads to IPFS, stores hash on blockchain
- Toast notification on success/error

### View Feedback
- Displays all feedback as cards
- Search/filter by Course ID
- Color-coded status badges
- View full feedback content from IPFS in modal

### Admin Dashboard
- Stats overview (Total, Pending, Resolved, Flagged)
- Table of all feedback
- Resolve / Flag action buttons
- Confirmation popup before status update

---

## Environment Variables

Create a `.env` file in the root:

```env
PRIVATE_KEY=your_wallet_private_key
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PORT=3002

PINATA_JWT=your_pinata_jwt_token
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

Get Pinata keys at: https://app.pinata.cloud/developers/api-keys

---

## Getting Started

### 1. Install dependencies
```bash
npm install
cd frontend && npm install
```

### 2. Compile the contract
```bash
npm run compile
```

### 3. Start local blockchain (Terminal 1)
```bash
npx hardhat node
```

### 4. Deploy contract (Terminal 2)
```bash
npx hardhat run scripts/deploy-feedback.js --network localhost
```

### 5. Start backend server (Terminal 3)
```bash
node server.js
```

### 6. Start frontend (Terminal 4)
```bash
cd frontend && npm run dev
```

Open http://localhost:5173 in your browser.

---

## Deploying to Polygon Amoy Testnet

1. Get test MATIC from https://faucet.polygon.technology
2. Set `AMOY_RPC_URL` and `PRIVATE_KEY` in `.env`
3. Run:
```bash
npm run deploy:feedback
```

---

## How It Works

```
Student submits feedback text
        ↓
Backend uploads text to IPFS via Pinata → gets CID hash
        ↓
Backend calls smart contract submitFeedback(hash, courseId)
        ↓
Blockchain stores hash + metadata permanently
        ↓
Admin can update status via updateStatus()
        ↓
Anyone can read feedback from blockchain + retrieve text from IPFS
```

---

## Status Types

| Status | Color | Description |
|---|---|---|
| Pending | Yellow | Newly submitted, awaiting review |
| Resolved | Green | Reviewed and resolved by admin |
| Flagged | Red | Flagged for further review |
