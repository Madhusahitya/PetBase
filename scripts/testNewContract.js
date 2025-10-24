const { ethers } = require("hardhat");

async function main() {
  console.log("Testing new contract deployment...");
  
  // Get the contract addresses from the deployment
  const PET_NFT_ADDRESS = "0x5b1FC26484f154b78Cde658a6B6Ee916BaFf0968";
  const PET_TOKEN_ADDRESS = "0x1FC5D9cBcF96eA0E4f3e731D3c449f54C21B7b4c";
  
  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // Get the contract instances
  const PetNFT = await ethers.getContractFactory("PetNFT");
  const petNFT = PetNFT.attach(PET_NFT_ADDRESS);
  
  const PETToken = await ethers.getContractFactory("PETToken");
  const petToken = PETToken.attach(PET_TOKEN_ADDRESS);
  
  try {
    // Test totalSupply
    const totalSupply = await petNFT.totalSupply();
    console.log("✅ Total supply:", totalSupply.toString());
    
    // Test minting a pet
    console.log("Creating test pet...");
    const tx = await petNFT.mintPet(
      deployer.address,
      "Test Pet",
      100,
      100,
      1
    );
    
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ Pet minted successfully!");
    
    // Check total supply again
    const newTotalSupply = await petNFT.totalSupply();
    console.log("New total supply:", newTotalSupply.toString());
    
    // Test getting pet name
    const petName = await petNFT.getPetName(1);
    console.log("Pet name:", petName);
    
    // Test getting pet stats
    const petStats = await petNFT.getPetStats(1);
    console.log("Pet stats:", petStats);
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
