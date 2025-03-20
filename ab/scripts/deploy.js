const hre = require("hardhat");

async function main() {
  // 1. Get the contract factory
  const EventVoting = await hre.ethers.getContractFactory("EventVoting");

  // 2. Deploy the contract
  //    The constructor for EventVoting has no required arguments if you used the version
  //    we shared (where you can call setupEvent later).
  const eventVoting = await EventVoting.deploy();

  // 3. Wait for the deployment to finish
  await eventVoting.waitForDeployment();

  // 4. Get the deployed contract address
  const contractAddress = await eventVoting.getAddress();

  console.log("EventVoting contract deployed to:", contractAddress);
}

// This pattern is recommended to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });