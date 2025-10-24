# PetPals Contract Deployment Guide

## ✅ Contract Updates Completed

### 1. **PetNFT.sol Events Added**
- Added `PetMinted(uint256 indexed tokenId, address indexed owner, string name)` event
- Added `PetMintedDetailed(address indexed to, uint256 indexed tokenId, string name, uint256 health, uint256 happiness, uint256 level)` event
- Events are emitted after `_safeMint` in the `mintPet` function

### 2. **Deploy Script Enhanced**
- Added event logging during deployment
- Added test minting to verify events work
- Enhanced error handling for test mint failures
- Added timestamp and deployer info to addresses.json

### 3. **Compilation Successful**
- Contracts compile without errors
- Events are properly defined and emitted

## 🚀 Deployment Status

### ✅ Local Network (Hardhat)
- **Status**: Successfully deployed and tested
- **PETToken**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **PetNFT**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Events**: ✅ Working correctly

### ⚠️ Base Testnet (Base Sepolia)
- **Status**: Partial deployment (nonce issues)
- **Issue**: Nonce conflicts preventing complete deployment
- **Solution**: Wait for nonce to reset or use different wallet

### ❌ Base Mainnet
- **Status**: Not deployed (insufficient funds)
- **Issue**: Wallet needs ETH for gas fees
- **Solution**: Add ETH to wallet for deployment

## 📋 Manual Deployment Instructions

### For Base Testnet:
```bash
# Wait for nonce to reset, then run:
npx hardhat run scripts/deploy.js --network base-sepolia

# Verify contracts:
npx hardhat run scripts/verify.js --network base-sepolia
```

### For Base Mainnet:
1. **Add ETH to wallet** (0x960988C50d7Bcf0C90b07Cf50D50c3aA256A99Ab)
2. **Deploy contracts**:
   ```bash
   npx hardhat run scripts/deploy.js --network base
   ```
3. **Verify contracts**:
   ```bash
   npx hardhat run scripts/verify.js --network base
   ```

## 🔍 Event Verification

The contracts emit the following events when minting pets:

### PetMinted Event
```solidity
event PetMinted(uint256 indexed tokenId, address indexed owner, string name);
```

### PetMintedDetailed Event
```solidity
event PetMintedDetailed(address indexed to, uint256 indexed tokenId, string name, uint256 health, uint256 happiness, uint256 level);
```

## 📊 Test Results

Local deployment successfully showed:
- ✅ PETToken deployed
- ✅ PetNFT deployed
- ✅ Events emitted correctly
- ✅ Test minting worked
- ✅ Event parsing successful

## 🔧 Next Steps

1. **Resolve nonce issues** for Base testnet deployment
2. **Add ETH to wallet** for Base mainnet deployment
3. **Update frontend** with new contract addresses
4. **Test real-time event listening** in the frontend

## 📝 Contract Addresses

After successful deployment, update your `.env` file:
```env
NEXT_PUBLIC_PETNFT_ADDRESS=<deployed_petnft_address>
NEXT_PUBLIC_PET_ADDRESS=<deployed_pettoken_address>
```
