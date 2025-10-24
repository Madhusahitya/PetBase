const { ethers, network, run } = require('hardhat')
const fs = require('fs')
const path = require('path')

async function main() {
  console.log('Network:', network.name)
  const [deployer] = await ethers.getSigners()
  console.log('Deployer:', deployer.address)

  // Deploy PETToken
  console.log('Deploying PETToken...')
  const PET = await ethers.getContractFactory('PETToken')
  const pet = await PET.deploy()
  await pet.waitForDeployment()
  const petAddr = await pet.getAddress()
  console.log('PETToken deployed to:', petAddr)

  // Deploy PetNFT
  console.log('Deploying PetNFT...')
  const NFT = await ethers.getContractFactory('PetNFT')
  const nft = await NFT.deploy()
  await nft.waitForDeployment()
  const nftAddr = await nft.getAddress()
  console.log('PetNFT deployed to:', nftAddr)

  // Wire PET into NFT
  const setTx = await nft.setPetToken(petAddr)
  await setTx.wait()
  console.log('Set PET token on PetNFT')
  
  // Set PetNFT as minter for PET token
  const addMinterTx = await pet.addMinter(nftAddr)
  await addMinterTx.wait()
  console.log('Set PetNFT as minter for PET token')

  // Test minting to verify events
  console.log('Testing mintPet function and events...')
  try {
    const mintTx = await nft.mintPet(
      deployer.address,
      "TestPet",
      100,
      100,
      1
    )
    const receipt = await mintTx.wait()
    
    // Log events from the mint transaction
    console.log('Mint transaction events:')
    receipt.logs.forEach((log, index) => {
      try {
        const parsed = nft.interface.parseLog(log)
        console.log(`Event ${index + 1}: ${parsed.name}`)
        console.log(`  Args:`, parsed.args)
      } catch (e) {
        console.log(`Event ${index + 1}: (unable to parse)`)
      }
    })
  } catch (error) {
    console.log('Test mint failed (this is expected on some networks):', error.message)
    console.log('Contracts deployed successfully, but test mint failed')
  }

  // Save addresses
  const outDir = path.join(__dirname, '..', 'artifacts')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const addressesPath = path.join(outDir, 'addresses.json')
  const data = { 
    network: network.name, 
    PETToken: petAddr, 
    PetNFT: nftAddr,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  }
  fs.writeFileSync(addressesPath, JSON.stringify(data, null, 2))
  console.log('Saved addresses to', addressesPath)

  console.log('Deployment complete!')
  console.log('PETToken:', petAddr)
  console.log('PetNFT:', nftAddr)
  console.log('Deployer:', deployer.address)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
