// Generate mock Basename for pets
export function generateBasename(petName: string, tokenId: string): string {
  const safePetName = petName || 'pet'
  const safeTokenId = tokenId || '1'
  const cleanName = safePetName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  return `${cleanName}${randomSuffix}.base.eth`
}

// Generate share URLs
export function generateShareUrls(petName: string, basename: string, tokenId: string) {
  const safePetName = petName || 'pet'
  const safeBasename = basename || 'pet.base.eth'
  const safeTokenId = tokenId || '1'
  const text = `I adopted ${safePetName} on PetPals! Join: ${safeBasename} #BaseBatches #PetPals`
  const url = `${window.location.origin}/adopt?ref=${safeTokenId}`
  
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    discord: `https://discord.com/channels/@me`,
    webShare: { text, url }
  }
}
