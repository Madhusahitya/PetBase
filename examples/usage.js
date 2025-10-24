const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const PetNFT = await ethers.getContractFactory("PetNFT");
  
  // Deploy the contract
  console.log("Deploying PetNFT contract...");
  const petNFT = await PetNFT.deploy();
  await petNFT.waitForDeployment();
  
  const contractAddress = await petNFT.getAddress();
  console.log("PetNFT deployed to:", contractAddress);
  
  // Get signers
  const [owner, user1, user2] = await ethers.getSigners();
  
  // Mint a pet for user1
  console.log("\nMinting a pet for user1...");
  const mintTx = await petNFT.mintPet(
    user1.address,
    "Fluffy",
    100,
    85,
    1
  );
  await mintTx.wait();
  console.log("Pet 'Fluffy' minted successfully!");
  
  // Get pet stats
  const petStats = await petNFT.getPetStats(1);
  console.log("Pet stats:", {
    health: petStats.health.toString(),
    happiness: petStats.happiness.toString(),
    level: petStats.level.toString()
  });
  
  // Add user2 to alliance
  console.log("\nAdding user2 to alliance...");
  const addAllianceTx = await petNFT.addAlliance(user2.address);
  await addAllianceTx.wait();
  console.log("User2 added to alliance!");
  
  // User1 upgrades their pet
  console.log("\nUser1 upgrading their pet...");
  const upgradeTx1 = await petNFT.connect(user1).upgradeTrait(1, "laser eyes");
  await upgradeTx1.wait();
  console.log("Added 'laser eyes' trait!");
  
  // User2 (alliance member) upgrades user1's pet
  console.log("\nUser2 (alliance member) upgrading user1's pet...");
  const upgradeTx2 = await petNFT.connect(user2).upgradeTrait(1, "golden fur");
  await upgradeTx2.wait();
  console.log("Added 'golden fur' trait!");
  
  // Get all traits
  const traits = await petNFT.getPetTraits(1);
  console.log("All pet traits:", traits);
  
  // Get token URI
  const tokenURI = await petNFT.tokenURI(1);
  console.log("Token URI:", tokenURI);
  
  console.log("\nExample completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
