const { ethers } = require("hardhat");

async function main() {
  console.log("Testing pet name retrieval...");
  
  const PET_NFT_ADDRESS = "0x5b1FC26484f154b78Cde658a6B6Ee916BaFf0968";
  const [deployer] = await ethers.getSigners();
  
  const PetNFT = await ethers.getContractFactory("PetNFT");
  const petNFT = PetNFT.attach(PET_NFT_ADDRESS);
  
  try {
    // Get pet name
    const petName = await petNFT.getPetName(1);
    console.log("✅ Pet name:", petName);
    
    // Get pet stats
    const petStats = await petNFT.getPetStats(1);
    console.log("✅ Pet stats:", petStats);
    
    // Get total supply
    const totalSupply = await petNFT.totalSupply();
    console.log("✅ Total supply:", totalSupply.toString());
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
