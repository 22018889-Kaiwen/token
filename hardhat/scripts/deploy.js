const hre = require("hardhat");

async function main() {
  const signerAddress = "";

  // Get the signer from the address
  const signer = await hre.ethers.getSigner(signerAddress);

  console.log("Deploying contracts with the account:", signer.address);

  // Get the contract factory
  const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");

  // Deploy the contract (assuming no additional constructor arguments)
  const tokenFactory = await TokenFactory.deploy();

  // Wait for the deployment to be mined
  await tokenFactory.waitForDeployment();

  console.log(
    "Token contract deployed at address:",
    await tokenFactory.getAddress()
  );
}

// Execute the deployment function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
