/**
 * Base Username Generator for PetBase
 * Generates unique Base usernames in the format: petname.base.eth
 */

// List of common pet name suffixes to ensure uniqueness
const PET_SUFFIXES = [
  'paws', 'tail', 'whiskers', 'fluffy', 'spot', 'patch', 'stripe', 'dot',
  'paw', 'claw', 'fang', 'wing', 'scale', 'fur', 'feather', 'sparkle',
  'shine', 'glow', 'bright', 'happy', 'joy', 'love', 'heart', 'star'
]

// List of Base-themed suffixes for uniqueness
const BASE_SUFFIXES = [
  'base', 'layer', 'foundation', 'core', 'chain', 'block', 'node', 'link',
  'bridge', 'gate', 'portal', 'hub', 'zone', 'realm', 'world', 'space'
]

/**
 * Generates a unique Base username for a pet
 * Format: {petname}{suffix}.base.eth
 * 
 * @param petName - The original pet name
 * @param petType - The type of pet (puppy, kitten, dragon)
 * @param tokenId - The token ID for additional uniqueness
 * @returns A unique Base username
 */
export function generateBaseUsername(petName: string, petType: string, tokenId?: string): string {
  // Clean the pet name (remove spaces, special chars, convert to lowercase)
  const cleanName = petName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 8) // Limit to 8 characters for the base name

  // Generate a unique suffix based on pet type and token ID
  const petSuffix = PET_SUFFIXES[Math.abs(cleanName.charCodeAt(0)) % PET_SUFFIXES.length]
  const baseSuffix = BASE_SUFFIXES[Math.abs(cleanName.length) % BASE_SUFFIXES.length]
  
  // Add token ID for additional uniqueness if available
  const tokenSuffix = tokenId ? tokenId.slice(-2) : Math.random().toString(36).slice(-2)
  
  // Combine everything to create a unique username
  const username = `${cleanName}${petSuffix}${baseSuffix}${tokenSuffix}.base.eth`
  
  return username
}

/**
 * Validates if a Base username is properly formatted
 * @param username - The username to validate
 * @returns boolean indicating if the username is valid
 */
export function isValidBaseUsername(username: string): boolean {
  const baseUsernameRegex = /^[a-z0-9]+\.base\.eth$/
  return baseUsernameRegex.test(username.toLowerCase())
}

/**
 * Extracts the display name from a Base username
 * @param username - The Base username
 * @returns The display name without the .base.eth suffix
 */
export function getDisplayNameFromUsername(username: string): string {
  return username.replace('.base.eth', '')
}

/**
 * Generates a shareable link for a pet's Base username
 * @param username - The Base username
 * @param tokenId - The pet's token ID
 * @returns A shareable URL
 */
export function generateShareableLink(username: string, tokenId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://petbase.vercel.app'
  return `${baseUrl}/pet/${username}?tokenId=${tokenId}`
}

/**
 * Creates a social media share text for a pet
 * @param petName - The pet's name
 * @param username - The Base username
 * @param tokenId - The pet's token ID
 * @returns Formatted text for social sharing
 */
export function generateSocialShareText(petName: string, username: string, tokenId: string): string {
  const shareableLink = generateShareableLink(username, tokenId)
  return `🐾 Meet ${petName}! Their Base username is ${username} 🚀\n\nJoin their tribe and help care for them on PetBase!\n\n${shareableLink}\n\n#PetBase #BaseBlockchain #VirtualPets #Web3`
}
