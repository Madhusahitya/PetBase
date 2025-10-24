const { ethers } = require('hardhat')

async function main() {
  console.log('Testing new PetNFT contract...')
  
  // Contract addresses from deployment
  const PET_NFT_ADDRESS = '0x318E81B4a5472EB9E98E693CDC7274E79ab8e718'
  const PET_TOKEN_ADDRESS = '0x4332aC5B66381d20012956b60279306b62649C53'
  
  // Get the contract
  const PetNFT = await ethers.getContractFactory('PetNFT')
  const petNFT = PetNFT.attach(PET_NFT_ADDRESS)
  
  console.log('Contract address:', PET_NFT_ADDRESS)
  console.log('Contract owner:', await petNFT.owner())
  
  // Test getPetName function
  try {
    console.log('Testing getPetName function...')
    const name = await petNFT.getPetName(1)
    console.log('Pet name for token 1:', name)
  } catch (error) {
    console.log('getPetName test failed:', error.message)
  }
  
  // Test totalSupply
  try {
    const totalSupply = await petNFT.totalSupply()
    console.log('Total supply:', totalSupply.toString())
  } catch (error) {
    console.log('totalSupply test failed:', error.message)
  }
  
  // Test minting a pet
  try {
    console.log('Testing mintPet function...')
    const [deployer] = await ethers.getSigners()
    const tx = await petNFT.mintPet(
      deployer.address,
      "TestPet",
      100,
      100,
      1
    )
    const receipt = await tx.wait()
    console.log('Mint transaction hash:', tx.hash)
    console.log('Gas used:', receipt.gasUsed.toString())
    
    // Get the new pet's name
    const newTokenId = await petNFT.totalSupply()
    const newPetName = await petNFT.getPetName(newTokenId)
    console.log('New pet name:', newPetName)
    
  } catch (error) {
    console.log('Mint test failed:', error.message)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
