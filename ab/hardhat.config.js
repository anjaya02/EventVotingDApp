require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();  // Load .env file

// Pull in the environment variables
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
    },
    // you can add other networks like localhost, goerli, mainnet, etc.
  },
};
