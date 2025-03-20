It looks great overall, but there’s a small **Markdown formatting** issue with the code fencing. Specifically, the code block that starts with <code>```md</code> is never explicitly closed before the next code blocks begin.

Below is a **fixed version** of your `README.md` with proper code blocks:

```md
# Event Voting DApp

## Overview
The **Event Voting DApp** is a decentralized application (DApp) built using Solidity, Hardhat, and React.js with Ethers.js. It allows event organizers to create and manage voting events where users can securely cast votes for candidates.

## Features
- ✅ **Multi-Event Voting**: Supports multiple voting events with unique candidates.
- ✅ **Blockchain Security**: Votes are stored securely on the Ethereum blockchain.
- ✅ **Smart Contract-Based**: Transparent and tamper-proof voting.
- ✅ **MetaMask Integration**: Users can connect their wallets to vote.
- ✅ **Admin Controls**: Only the contract owner can create events, start/stop voting.

## Technologies Used
- **Solidity** - Smart contract development  
- **Hardhat** - Ethereum development environment  
- **Ethers.js** - Blockchain interaction  
- **React.js** - Frontend for the voting DApp  
- **MetaMask** - Wallet integration  

## Installation & Setup

### 1. Clone the Repository
```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/EventVotingDApp.git
cd EventVotingDApp
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your **Infura/Alchemy API key** and **private key** for deployment:
```sh
INFURA_API_KEY=your-infura-api-key
PRIVATE_KEY=your-wallet-private-key
```

---

## Smart Contract Deployment

### 1. Compile the Smart Contract
```sh
npx hardhat compile
```

### 2. Deploy to Local Hardhat Network
```sh
npx hardhat node
```
Open another terminal and run:
```sh
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Deploy to a Testnet (e.g., Sepolia, Goerli)
```sh
npx hardhat run scripts/deploy.js --network sepolia
```

---

## Running the Frontend

### 1. Update the Contract Address
Copy the deployed contract address and update it in the **frontend environment**:
```sh
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

### 2. Start the Frontend
```sh
cd frontend
npm install
npm run dev
```
The application will be available at **http://localhost:5173**.

---

## Usage Guide

1. **Connect MetaMask**: Click 'Connect Wallet' to authenticate.
2. **Create an Event** (Admin only): Set event name & candidates.
3. **Start Voting**: Admin initiates voting with a time limit.
4. **Vote**: Users select their candidate & submit votes.
5. **End Voting**: Admin closes voting and results are displayed.

---

## License
This project is licensed under the [MIT License](LICENSE).

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you’d like to change.

## Contact
For any questions or support, reach out to:
- **GitHub**: https://github.com/anjaya02
- **Email**: anjayainduwara@gmail.com

---

🚀 **Happy Voting!**
```

**Key Notes:**
- Ensure each code block is opened with <code>```sh</code> (or just triple backticks) and properly closed before starting a new section.
- Replace all placeholders like `YOUR_GITHUB_USERNAME`, `your-infura-api-key`, etc., with your actual values. 
- Now your README is fully valid Markdown and ready for GitHub!
