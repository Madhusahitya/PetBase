const { ethers } = require('hardhat');

async function checkBalance() {
    console.log('🔍 Checking PET token balance...');
    
    // Get the deployed contract
    const PETToken = await ethers.getContractAt('PETToken', '0x1FC5D9cBcF96eA0E4f3e731D3c449f54C21B7b4c');
    
    // Get the deployer address
    const [deployer] = await ethers.getSigners();
    console.log('Deployer address:', deployer.address);
    
    // Check deployer's balance
    const balance = await PETToken.balanceOf(deployer.address);
    console.log('Deployer balance:', ethers.formatEther(balance), 'PET');
    
    // Check total supply
    const totalSupply = await PETToken.totalSupply();
    console.log('Total supply:', ethers.formatEther(totalSupply), 'PET');
    
    // Check if deployer is the owner
    const owner = await PETToken.owner();
    console.log('Contract owner:', owner);
    console.log('Is deployer the owner?', owner.toLowerCase() === deployer.address.toLowerCase());
}

checkBalance().catch(console.error);