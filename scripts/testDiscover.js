const { ethers } = require("hardhat");

async function main() {
  console.log("Testing PetNFT discovery functionality...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Get the deployed contract
  const PetNFT = await ethers.getContractFactory("PetNFT");
  const petNFT = PetNFT.attach("0xB7c9232C6cedA66bA65d14b7BE3923855c11bBD6");

  // Check total supply
  const totalSupply = await petNFT.totalSupply();
  console.log("Total supply:", totalSupply.toString());

  // Get pet stats for token 1
  if (totalSupply > 0) {
    const stats = await petNFT.getPetStats(1);
    console.log("Pet 1 stats:", {
      health: stats[0].toString(),
      happiness: stats[1].toString(),
      level: stats[2].toString()
    });

    const name = await petNFT.getPetName(1);
    console.log("Pet 1 name:", name);

    const owner = await petNFT.ownerOf(1);
    console.log("Pet 1 owner:", owner);
  }

  console.log("Discovery test completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
