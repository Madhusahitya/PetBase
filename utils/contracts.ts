import PetNFTArtifact from '@/abis/PetNFT.json'
import PETTokenArtifact from '@/abis/PETToken.json'

// Use deployed contract addresses (Updated after airdrop system deployment)
// The address with actual pets: 0xd17ec0F6D7A2dba5b83f56aB2794631C9F46f278
const ENV_PET_NFT_ADDRESS = process.env.NEXT_PUBLIC_PETNFT_ADDRESS as `0x${string}`
const ENV_PET_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_PETTOKEN_ADDRESS as `0x${string}`

// Use the newly deployed contract addresses
const ACTIVE_PET_NFT_ADDRESS = '0x5b1FC26484f154b78Cde658a6B6Ee916BaFf0968' as `0x${string}`
const ACTIVE_PET_TOKEN_ADDRESS = '0x1FC5D9cBcF96eA0E4f3e731D3c449f54C21B7b4c' as `0x${string}`

// Force use of new contract addresses (ignore environment variables for now)
export const PET_NFT_ADDRESS = ACTIVE_PET_NFT_ADDRESS
export const PET_TOKEN_ADDRESS = ACTIVE_PET_TOKEN_ADDRESS

// Debug ABI loading
console.log('PetNFTArtifact:', PetNFTArtifact)
console.log('PetNFTArtifact type:', typeof PetNFTArtifact)
console.log('PetNFTArtifact is array:', Array.isArray(PetNFTArtifact))

// The PetNFT.json file is now an artifact with .abi property
export const PET_NFT_ABI = (PetNFTArtifact as any)?.abi || []
export const PET_TOKEN_ABI = (PETTokenArtifact as any)?.abi || []

// Fallback ABI if import fails
const PET_NFT_ABI_FALLBACK = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "uint256", "name": "health", "type": "uint256"},
      {"internalType": "uint256", "name": "happiness", "type": "uint256"},
      {"internalType": "uint256", "name": "level", "type": "uint256"}
    ],
    "name": "mintPet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as any[]

// Use fallback if main ABI is empty
export const PET_NFT_ABI_FINAL = (PET_NFT_ABI && PET_NFT_ABI.length > 0) ? PET_NFT_ABI : PET_NFT_ABI_FALLBACK

console.log('PET_NFT_ABI:', PET_NFT_ABI)
console.log('PET_NFT_ABI type:', typeof PET_NFT_ABI)
console.log('PET_NFT_ABI is array:', Array.isArray(PET_NFT_ABI))
console.log('PET_NFT_ABI length:', PET_NFT_ABI?.length)
console.log('🚀 PET_NFT_ADDRESS (hardcoded):', PET_NFT_ADDRESS)
console.log('🚀 Environment NEXT_PUBLIC_PETNFT_ADDRESS:', process.env.NEXT_PUBLIC_PETNFT_ADDRESS)

// Check if contract is deployed
export const isContractDeployed = () => {
  return PET_NFT_ADDRESS !== '0x0000000000000000000000000000000000000000'
}


