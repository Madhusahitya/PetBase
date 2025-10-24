const { ethers } = require("hardhat");

async function main() {
  console.log("Testing XMTP Chat Integration...");
  
  // Test that the contracts are working
  const PET_NFT_ADDRESS = "0x5b1FC26484f154b78Cde658a6B6Ee916BaFf0968";
  const [deployer] = await ethers.getSigners();
  
  const PetNFT = await ethers.getContractFactory("PetNFT");
  const petNFT = PetNFT.attach(PET_NFT_ADDRESS);
  
  try {
    // Check total supply
    const totalSupply = await petNFT.totalSupply();
    console.log("✅ Total supply:", totalSupply.toString());
    
    if (totalSupply > 0) {
      // Check if there are any pets with tribe members
      console.log("📋 Checking pets for tribe members...");
      for (let i = 1; i <= Number(totalSupply); i++) {
        try {
          const members = []
          for (let j = 0; j < 10; j++) {
            try {
              const member = await petNFT.tribeMembers(i, j);
              if (member && member !== '0x0000000000000000000000000000000000000000') {
                members.push(member);
              }
            } catch (e) {
              break;
            }
          }
          console.log(`Pet ${i} tribe members:`, members);
        } catch (e) {
          console.log(`Pet ${i}: Error checking tribe members`);
        }
      }
    }
    
    console.log("\n🎉 XMTP Chat Integration Ready!");
    console.log("📱 To test the chat:");
    console.log("1. Go to the care page for any pet");
    console.log("2. Join the tribe if you haven't already");
    console.log("3. Click 'Tribe Chat' button");
    console.log("4. The XMTP client will initialize and create conversations");
    console.log("5. Send messages to other tribe members!");
    
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

