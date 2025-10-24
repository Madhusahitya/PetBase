const { ethers } = require("hardhat");

async function main() {
  console.log("Testing PetNFT minting and events...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Get the deployed contract
  const PetNFT = await ethers.getContractFactory("PetNFT");
  const petNFT = PetNFT.attach("0xB7c9232C6cedA66bA65d14b7BE3923855c11bBD6");

  // Mint a test pet
  console.log("Minting test pet...");
  const mintTx = await petNFT.mintPet(
    deployer.address,
    "TestPet",
    100,
    100,
    1
  );
  
  console.log("Mint transaction hash:", mintTx.hash);
  const receipt = await mintTx.wait();
  
  console.log("Mint successful! Block number:", receipt.blockNumber);
  
  // Log events
  console.log("\nEvents emitted:");
  receipt.logs.forEach((log, index) => {
    try {
      const parsed = petNFT.interface.parseLog(log);
      console.log(`Event ${index + 1}: ${parsed.name}`);
      console.log(`  Args:`, parsed.args);
    } catch (e) {
      console.log(`Event ${index + 1}: (unable to parse)`);
    }
  });

  console.log("\nTest mint completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
