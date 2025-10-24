# PetBase Subgraph

A subgraph for indexing PetBase NFT contract events on Base network.

## Overview

This subgraph indexes the following events from the PetBase contract:
- `PetMinted(uint256 indexed tokenId, address indexed owner, string name)`
- `PetMintedDetailed(address indexed to, uint256 indexed tokenId, string name, uint256 health, uint256 happiness, uint256 level)`

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Update Contract Address

Edit `subgraph.yaml` and replace the placeholder address:
```yaml
source:
  address: "0xYOUR_DEPLOYED_CONTRACT_ADDRESS"  # Replace with actual deployed address
  startBlock: 12345678  # Replace with actual deployment block
```

### 3. Generate Code

```bash
npm run codegen
```

### 4. Build Subgraph

```bash
npm run build
```

### 5. Deploy to The Graph Studio

1. Go to [studio.thegraph.com](https://studio.thegraph.com)
2. Create a new subgraph
3. Get your deployment key
4. Deploy:

```bash
graph auth --studio YOUR_DEPLOYMENT_KEY
graph deploy --studio petpals-subgraph
```

## GraphQL Queries

### Get All Pets (Ordered by Token ID Descending)

```graphql
query GetAllPets {
  pets(
    orderBy: tokenId
    orderDirection: desc
    first: 100
  ) {
    id
    tokenId
    owner
    name
    health
    happiness
    level
    createdAt
    createdAtBlock
    transactionHash
  }
}
```

### Get Pet by Token ID

```graphql
query GetPet($tokenId: String!) {
  pet(id: $tokenId) {
    id
    tokenId
    owner
    name
    health
    happiness
    level
    createdAt
    createdAtBlock
    transactionHash
  }
}
```

### Get Pets by Owner

```graphql
query GetPetsByOwner($owner: Bytes!) {
  pets(
    where: { owner: $owner }
    orderBy: tokenId
    orderDirection: desc
  ) {
    id
    tokenId
    owner
    name
    health
    happiness
    level
    createdAt
  }
}
```

### Get Recent Pet Mints

```graphql
query GetRecentPetMints {
  petMints(
    orderBy: timestamp
    orderDirection: desc
    first: 50
  ) {
    id
    tokenId
    owner
    name
    health
    happiness
    level
    timestamp
    blockNumber
    transactionHash
  }
}
```

### Get Pet Statistics

```graphql
query GetPetStats {
  pets(
    first: 1000
  ) {
    tokenId
    health
    happiness
    level
  }
}
```

## Schema

### Pet Entity
- `id`: Token ID (string)
- `tokenId`: NFT token ID (BigInt)
- `owner`: Owner address (Bytes)
- `name`: Pet name (String)
- `health`: Pet health (BigInt)
- `happiness`: Pet happiness (BigInt)
- `level`: Pet level (BigInt)
- `createdAt`: Block timestamp when minted (BigInt)
- `createdAtBlock`: Block number when minted (BigInt)
- `transactionHash`: Transaction hash of mint (Bytes)

### PetMint Entity
- `id`: Transaction hash + log index (string)
- `tokenId`: NFT token ID (BigInt)
- `owner`: Owner address (Bytes)
- `name`: Pet name (String)
- `health`: Pet health (BigInt)
- `happiness`: Pet happiness (BigInt)
- `level`: Pet level (BigInt)
- `timestamp`: Block timestamp (BigInt)
- `blockNumber`: Block number (BigInt)
- `transactionHash`: Transaction hash (Bytes)

## Development

### Local Development

1. Start a local Graph node
2. Create local subgraph:
   ```bash
   npm run create-local
   ```
3. Deploy locally:
   ```bash
   npm run deploy-local
   ```

### Testing

```bash
npm run test
```

## Network Configuration

This subgraph is configured for Base mainnet. To use with other networks:

1. Update `subgraph.yaml` network field
2. Update contract address and start block
3. Redeploy the subgraph

## Troubleshooting

### Common Issues

1. **Contract not found**: Ensure contract address and start block are correct
2. **Events not indexing**: Check that events are being emitted correctly
3. **Build failures**: Run `npm run codegen` before building

### Support

For issues with this subgraph, please check:
- [The Graph Documentation](https://thegraph.com/docs/)
- [Graph Protocol GitHub](https://github.com/graphprotocol)