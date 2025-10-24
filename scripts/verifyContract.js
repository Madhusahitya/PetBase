const { ethers } = require("hardhat");

async function main() {
  console.log("Verifying contract addresses and functionality...");
  
  // These should match what's in contracts.ts
  const PET_NFT_ADDRESS = "0x5b1FC26484f154b78Cde658a6B6Ee916BaFf0968";
  const PET_TOKEN_ADDRESS = "0x1FC5D9cBcF96eA0E4f3e731D3c449f54C21B7b4c";
  
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  const PetNFT = await ethers.getContractFactory("PetNFT");
  const petNFT = PetNFT.attach(PET_NFT_ADDRESS);
  
  try {
    // Check total supply
    const totalSupply = await petNFT.totalSupply();
    console.log("✅ Total supply:", totalSupply.toString());
    
    // Check if there are any pets
    if (totalSupply > 0) {
      console.log("📋 Checking existing pets...");
      for (let i = 1; i <= Number(totalSupply); i++) {
        try {
          const petName = await petNFT.getPetName(i);
          const petStats = await petNFT.getPetStats(i);
          const owner = await petNFT.ownerOf(i);
          console.log(`Pet ${i}: Name="${petName}", Stats=${petStats}, Owner=${owner}`);
        } catch (e) {
          console.log(`Pet ${i}: Error - ${e.message}`);
        }
      }
    } else {
      console.log("No pets found. Let's create one...");
      
      // Create a test pet
      const tx = await petNFT.mintPet(
        deployer.address,
        "My Test Pet",
        100,
        100,
        1,
        { gasLimit: 500000 }
      );
      
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Test pet created!");
      
      // Check the new pet
      const petName = await petNFT.getPetName(1);
      console.log("✅ New pet name:", petName);
    }
    
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
