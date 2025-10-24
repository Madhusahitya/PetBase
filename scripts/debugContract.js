const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  // Use the deployed contract on Base Sepolia
  const provider = new ethers.JsonRpcProvider(process.env.BASE_TESTNET_RPC || "https://sepolia.base.org");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000", provider);
  
  console.log("Debugging contract...");
  console.log("Wallet:", wallet.address);
  const contractAddress = "0xF8a839df21bA51D6DF1a53EC7Eb951B4fA1166Ed";
  console.log("Contract:", contractAddress);
  
  try {
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function owner() view returns (address)",
      "function petToken() view returns (address)",
      "function mintPet(address to, string memory name, uint256 health, uint256 happiness, uint256 level) external",
      "function getPetStats(uint256 tokenId) view returns (uint256 health, uint256 happiness, uint256 level)"
    ], wallet);
    
    // Test basic contract calls
    console.log("\n=== Basic Contract Info ===");
    const name = await contract.name();
    console.log("Name:", name);
    
    const symbol = await contract.symbol();
    console.log("Symbol:", symbol);
    
    const totalSupply = await contract.totalSupply();
    console.log("Total Supply:", totalSupply.toString());
    
    const owner = await contract.owner();
    console.log("Owner:", owner);
    
    const petToken = await contract.petToken();
    console.log("PET Token:", petToken);
    
    // Try to estimate gas for mintPet
    console.log("\n=== Gas Estimation ===");
    try {
      const gasEstimate = await contract.mintPet.estimateGas(
        wallet.address,
        "TestPet",
        100,
        100,
        1
      );
      console.log("Gas estimate:", gasEstimate.toString());
    } catch (error) {
      console.log("Gas estimation failed:", error.message);
    }
    
    // Try to actually mint a pet
    console.log("\n=== Testing Mint ===");
    try {
      const mintTx = await contract.mintPet(
        wallet.address,
        "TestPet",
        100,
        100,
        1
      );
      console.log("Mint transaction hash:", mintTx.hash);
      const receipt = await mintTx.wait();
      console.log("Mint successful! Block number:", receipt.blockNumber);
    } catch (error) {
      console.log("Mint failed:", error.message);
    }
    
  } catch (error) {
    console.error("Contract debug failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
