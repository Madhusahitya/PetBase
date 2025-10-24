const { ethers } = require('hardhat')

async function main() {
  const [deployer, u1, u2, u3] = await ethers.getSigners()
  console.log('Deployer:', deployer.address)

  // Deploy PET token
  const PET = await ethers.getContractFactory('PETToken')
  const pet = await PET.deploy()
  await pet.waitForDeployment()
  const petAddr = await pet.getAddress()
  console.log('PET deployed at', petAddr)

  // Deploy PetNFT
  const NFT = await ethers.getContractFactory('PetNFT')
  const nft = await NFT.deploy()
  await nft.waitForDeployment()
  const nftAddr = await nft.getAddress()
  console.log('PetNFT deployed at', nftAddr)

  // Configure PET token on NFT
  const setTx = await nft.setPetToken(petAddr)
  await setTx.wait()

  // Mint a pet to u1 with level 5
  const mintTx = await nft.mintPet(u1.address, 'Hero', 100, 100, 5)
  await mintTx.wait()
  console.log('Minted pet #1 to', u1.address)

  // u1 adds tribe members (u2 and u3)
  const add1 = await nft.connect(u1).tribeJoin(1, u2.address)
  await add1.wait()
  const add2 = await nft.connect(u1).tribeJoin(1, u3.address)
  await add2.wait()
  console.log('Added tribe members u2 and u3')

  // Fund deployer with PET if needed and approve NFT contract to transferFrom on deployer's behalf
  // Here deployer already owns initial PET supply from constructor mint
  const approveTx = await pet.approve(nftAddr, ethers.parseEther('1000'))
  await approveTx.wait()

  // Trigger milestone: send 100 PET split between tribe members
  const rewardAmount = ethers.parseEther('100')
  const before2 = await pet.balanceOf(u2.address)
  const before3 = await pet.balanceOf(u3.address)
  const milestoneTx = await nft.onMilestone(1, rewardAmount)
  await milestoneTx.wait()
  const after2 = await pet.balanceOf(u2.address)
  const after3 = await pet.balanceOf(u3.address)

  console.log('u2 PET delta:', after2 - before2)
  console.log('u3 PET delta:', after3 - before3)
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
