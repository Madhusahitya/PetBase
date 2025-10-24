const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const contractAddress = "0xd17ec0F6D7A2dba5b83f56aB2794631C9F46f278";
  
  console.log("Testing contract access...");
  console.log("Deployer:", deployer.address);
  console.log("Contract:", contractAddress);
  
  try {
    // Try to read from the contract
    const contract = new ethers.Contract(contractAddress, [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function totalSupply() view returns (uint256)"
    ], deployer);
    
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    
    console.log("✅ Contract accessible!");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Total Supply:", totalSupply.toString());
    
  } catch (error) {
    console.error("❌ Contract access failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
