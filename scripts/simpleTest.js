const { ethers } = require("hardhat");

async function main() {
  console.log("Simple contract test...");
  
  const PET_NFT_ADDRESS = "0x5b1FC26484f154b78Cde658a6B6Ee916BaFf0968";
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  const PetNFT = await ethers.getContractFactory("PetNFT");
  const petNFT = PetNFT.attach(PET_NFT_ADDRESS);
  
  try {
    // Check if PET token is set
    const petToken = await petNFT.petToken();
    console.log("PET token address:", petToken);
    
    // Check total supply
    const totalSupply = await petNFT.totalSupply();
    console.log("Total supply:", totalSupply.toString());
    
    // Try to mint with more gas
    console.log("Attempting to mint pet...");
    const tx = await petNFT.mintPet(
      deployer.address,
      "Test Pet",
      100,
      100,
      1,
      { gasLimit: 500000 }
    );
    
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Pet minted successfully! Gas used:", receipt.gasUsed.toString());
    
    // Check total supply again
    const newTotalSupply = await petNFT.totalSupply();
    console.log("New total supply:", newTotalSupply.toString());
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
