const { run } = require("hardhat");

async function main() {
  console.log("Verifying contracts on BaseScan...");
  
  // Read deployed addresses
  const fs = require('fs');
  const addressesPath = './artifacts/addresses.json';
  
  if (!fs.existsSync(addressesPath)) {
    console.error('Addresses file not found. Please deploy contracts first.');
    return;
  }
  
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  console.log('Deployed addresses:', addresses);

  // Verify PETToken
  if (addresses.PETToken) {
    console.log(`\nVerifying PETToken at ${addresses.PETToken}...`);
    try {
      await run("verify:verify", {
        address: addresses.PETToken,
        constructorArguments: [],
      });
      console.log("✅ PETToken verified successfully!");
    } catch (error) {
      console.error("❌ PETToken verification failed:", error.message);
    }
  }

  // Verify PetNFT
  if (addresses.PetNFT) {
    console.log(`\nVerifying PetNFT at ${addresses.PetNFT}...`);
    try {
      await run("verify:verify", {
        address: addresses.PetNFT,
        constructorArguments: [],
      });
      console.log("✅ PetNFT verified successfully!");
    } catch (error) {
      console.error("❌ PetNFT verification failed:", error.message);
    }
  }

  console.log("\nVerification complete!");
  console.log("\nContract addresses:");
  console.log(`PETToken: ${addresses.PETToken}`);
  console.log(`PetNFT: ${addresses.PetNFT}`);
  console.log(`Network: ${addresses.network}`);
  console.log(`Deployer: ${addresses.deployer}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });