const { ethers, network } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('Testing airdrop system...');
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const user1 = signers[1] || signers[0]; // Fallback to deployer if only one signer
  const user2 = signers[2] || signers[0]; // Fallback to deployer if only one signer
  
  // Contract addresses from latest deployment
  const petNFTAddress = '0x386029c702Ef383B9Da544F04Eef0Bb79c274832';
  const petTokenAddress = '0xCfdc3D90998Fd0894dc3307092844f88826B9c43';
  
  console.log('PetNFT Address:', petNFTAddress);
  console.log('PETToken Address:', petTokenAddress);
  console.log('Deployer:', deployer.address);
  console.log('User1:', user1.address);
  console.log('User2:', user2.address);

  const PetNFT = await ethers.getContractFactory('PetNFT');
  const petNFT = PetNFT.attach(petNFTAddress);

  const PETToken = await ethers.getContractFactory('PETToken');
  const petToken = PETToken.attach(petTokenAddress);

  try {
    // Test 1: Mint a pet
    console.log('\n=== Test 1: Minting a pet ===');
    const mintTx = await petNFT.mintPet(
      deployer.address,
      "AirdropTestPet",
      100, // High health for level up
      100, // High happiness
      1    // Level 1
    );
    const mintReceipt = await mintTx.wait();
    console.log('Pet minted successfully!');
    
    // Get the token ID from the Transfer event
    const transferEvent = mintReceipt.logs.find(log => {
      try {
        const parsed = petNFT.interface.parseLog(log);
        return parsed.name === 'Transfer';
      } catch (e) {
        return false;
      }
    });
    
    if (transferEvent) {
      const parsed = petNFT.interface.parseLog(transferEvent);
      const tokenId = parsed.args.tokenId.toString();
      console.log('Token ID:', tokenId);
      
      // Test 2: Join tribe
      console.log('\n=== Test 2: Joining tribe ===');
      const joinTx1 = await petNFT.connect(user1).tribeJoin(tokenId);
      await joinTx1.wait();
      console.log('User1 joined tribe');
      
      const joinTx2 = await petNFT.connect(user2).tribeJoin(tokenId);
      await joinTx2.wait();
      console.log('User2 joined tribe');
      
      // Test 3: Check initial airdrop count
      console.log('\n=== Test 3: Checking initial airdrop count ===');
      const initialAirdropCount = await petNFT.airdropCount(tokenId);
      console.log('Initial airdrop count:', ethers.formatEther(initialAirdropCount), 'PET');
      
      // Test 4: Level up to 5 (should trigger 5 PET airdrop)
      console.log('\n=== Test 4: Leveling up to 5 ===');
      for (let i = 1; i < 5; i++) {
        const levelUpTx = await petNFT.levelUp(tokenId);
        const levelUpReceipt = await levelUpTx.wait();
        console.log(`Leveled up to ${i + 1}`);
        
        // Check for AirdropDistributed event
        const airdropEvent = levelUpReceipt.logs.find(log => {
          try {
            const parsed = petNFT.interface.parseLog(log);
            return parsed.name === 'AirdropDistributed';
          } catch (e) {
            return false;
          }
        });
        
        if (airdropEvent) {
          const parsed = petNFT.interface.parseLog(airdropEvent);
          console.log('Airdrop event:', {
            tokenId: parsed.args.tokenId.toString(),
            amount: ethers.formatEther(parsed.args.amount),
            level: parsed.args.level.toString()
          });
        }
      }
      
      // Test 5: Check airdrop count after level 5
      console.log('\n=== Test 5: Checking airdrop count after level 5 ===');
      const airdropCountAfter5 = await petNFT.airdropCount(tokenId);
      console.log('Airdrop count after level 5:', ethers.formatEther(airdropCountAfter5), 'PET');
      
      // Test 6: Check PET token balances
      console.log('\n=== Test 6: Checking PET token balances ===');
      const user1Balance = await petToken.balanceOf(user1.address);
      const user2Balance = await petToken.balanceOf(user2.address);
      console.log('User1 PET balance:', ethers.formatEther(user1Balance));
      console.log('User2 PET balance:', ethers.formatEther(user2Balance));
      
      // Test 7: Level up to 10 (should trigger 10 PET airdrop)
      console.log('\n=== Test 7: Leveling up to 10 ===');
      for (let i = 5; i < 10; i++) {
        const levelUpTx = await petNFT.levelUp(tokenId);
        const levelUpReceipt = await levelUpTx.wait();
        console.log(`Leveled up to ${i + 1}`);
        
        // Check for AirdropDistributed event
        const airdropEvent = levelUpReceipt.logs.find(log => {
          try {
            const parsed = petNFT.interface.parseLog(log);
            return parsed.name === 'AirdropDistributed';
          } catch (e) {
            return false;
          }
        });
        
        if (airdropEvent) {
          const parsed = petNFT.interface.parseLog(airdropEvent);
          console.log('Airdrop event:', {
            tokenId: parsed.args.tokenId.toString(),
            amount: ethers.formatEther(parsed.args.amount),
            level: parsed.args.level.toString()
          });
        }
      }
      
      // Test 8: Final airdrop count and balances
      console.log('\n=== Test 8: Final airdrop count and balances ===');
      const finalAirdropCount = await petNFT.airdropCount(tokenId);
      const finalUser1Balance = await petToken.balanceOf(user1.address);
      const finalUser2Balance = await petToken.balanceOf(user2.address);
      
      console.log('Final airdrop count:', ethers.formatEther(finalAirdropCount), 'PET');
      console.log('Final User1 PET balance:', ethers.formatEther(finalUser1Balance));
      console.log('Final User2 PET balance:', ethers.formatEther(finalUser2Balance));
      
      console.log('\n✅ Airdrop system test completed successfully!');
      
    } else {
      console.error('Could not find Transfer event in mint transaction');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
