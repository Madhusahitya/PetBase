export interface MockPet {
  tokenId: string
  name: string
  type: 'puppy' | 'kitten' | 'dragon'
  health: number
  happiness: number
  level: number
  tribeSize: number
  maxTribeSize: number
  traits: string[]
  bio: string
  image: string
}

export const mockPets: MockPet[] = [
  {
    tokenId: '1',
    name: 'Buddy',
    type: 'puppy',
    health: 85,
    happiness: 92,
    level: 3,
    tribeSize: 4,
    maxTribeSize: 10,
    traits: ['Friendly', 'Energetic', 'Loyal'],
    bio: 'A playful golden retriever who loves fetch and making new friends!',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face'
  },
  {
    tokenId: '2',
    name: 'Whiskers',
    type: 'kitten',
    health: 78,
    happiness: 88,
    level: 2,
    tribeSize: 2,
    maxTribeSize: 10,
    traits: ['Curious', 'Independent', 'Cute'],
    bio: 'An adventurous tabby cat who loves climbing and exploring new places.',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop&crop=face'
  },
  {
    tokenId: '3',
    name: 'Flame',
    type: 'dragon',
    health: 95,
    happiness: 75,
    level: 5,
    tribeSize: 7,
    maxTribeSize: 10,
    traits: ['Majestic', 'Powerful', 'Wise'],
    bio: 'A noble dragon who protects the realm and guides young adventurers.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face'
  },
  {
    tokenId: '4',
    name: 'Luna',
    type: 'kitten',
    health: 90,
    happiness: 95,
    level: 4,
    tribeSize: 5,
    maxTribeSize: 10,
    traits: ['Mystical', 'Graceful', 'Magical'],
    bio: 'A mystical cat with silver fur that glows under moonlight.',
    image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=400&fit=crop&crop=face'
  },
  {
    tokenId: '5',
    name: 'Rex',
    type: 'puppy',
    health: 88,
    happiness: 82,
    level: 3,
    tribeSize: 6,
    maxTribeSize: 10,
    traits: ['Brave', 'Strong', 'Protective'],
    bio: 'A courageous German Shepherd who loves adventure and protecting his pack.',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop&crop=face'
  },
  {
    tokenId: '6',
    name: 'Sparkle',
    type: 'dragon',
    health: 92,
    happiness: 88,
    level: 4,
    tribeSize: 3,
    maxTribeSize: 10,
    traits: ['Shiny', 'Playful', 'Rare'],
    bio: 'A rare crystal dragon who loves to sparkle and make everyone smile.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face'
  },
  {
    tokenId: '7',
    name: 'Mittens',
    type: 'kitten',
    health: 75,
    happiness: 90,
    level: 2,
    tribeSize: 1,
    maxTribeSize: 10,
    traits: ['Soft', 'Cuddly', 'Sweet'],
    bio: 'A fluffy kitten with extra soft paws who loves cuddles and naps.',
    image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop&crop=face'
  },
  {
    tokenId: '8',
    name: 'Thunder',
    type: 'puppy',
    health: 95,
    happiness: 85,
    level: 4,
    tribeSize: 8,
    maxTribeSize: 10,
    traits: ['Fast', 'Energetic', 'Athletic'],
    bio: 'A lightning-fast Border Collie who loves running and agility training.',
    image: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=400&fit=crop&crop=face'
  },
  {
    tokenId: '9',
    name: 'Stardust',
    type: 'dragon',
    health: 88,
    happiness: 92,
    level: 3,
    tribeSize: 4,
    maxTribeSize: 10,
    traits: ['Cosmic', 'Dreamy', 'Unique'],
    bio: 'A cosmic dragon from the stars who brings magic and wonder to the world.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face'
  },
  {
    tokenId: '10',
    name: 'Cocoa',
    type: 'puppy',
    health: 82,
    happiness: 88,
    level: 2,
    tribeSize: 2,
    maxTribeSize: 10,
    traits: ['Sweet', 'Gentle', 'Loving'],
    bio: 'A gentle chocolate lab who loves treats and spreading joy to everyone.',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop&crop=face'
  }
]
