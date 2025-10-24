export const BASE_USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const

// Minimal ERC20 ABI
export const ERC20_ABI = [
  { "inputs": [{"internalType":"address","name":"owner","type":"address"}], "name": "balanceOf", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}], "name": "approve", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}], "name": "transfer", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "nonpayable", "type": "function" }
] as const

export const PET_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_PET_ADDRESS || '') as `0x${string}`

