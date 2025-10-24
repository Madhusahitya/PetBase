export interface StoredPet {
  tokenId: string
  name: string
  petType: 'puppy' | 'kitten' | 'dragon'
  health: number
  happiness: number
  level: number
  traits: string[]
  bio: string
  image?: string
  tribeSize: number
  maxTribeSize: number
  createdAt: number
  owner: string
}

const STORAGE_KEY = 'petbase-created-pets'

export function saveCreatedPet(pet: StoredPet) {
  try {
    const existingPets = getCreatedPets()
    const updatedPets = [...existingPets, pet]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPets))
    console.log('Pet saved to localStorage:', pet)
    console.log('All pets in storage:', updatedPets)
    return true
  } catch (error) {
    console.error('Error saving pet:', error)
    return false
  }
}

export function getCreatedPets(): StoredPet[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error loading pets:', error)
    return []
  }
}

export function getAllPets(): StoredPet[] {
  // Return only real created pets, no mock data
  const createdPets = getCreatedPets()
  
  // Sort by creation date, newest first
  return Array.isArray(createdPets)
    ? [...createdPets].sort((a, b) => b.createdAt - a.createdAt)
    : []
}

export function joinPetTribe(tokenId: string, userAddress: string) {
  try {
    const pets = getCreatedPets()
    const petIndex = pets.findIndex(p => p.tokenId === tokenId)
    
    if (petIndex !== -1) {
      const pet = pets[petIndex]
      if (pet.tribeSize < pet.maxTribeSize) {
        pet.tribeSize += 1
        pets[petIndex] = pet
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pets))
        
        // Trigger custom event to notify UI
        window.dispatchEvent(new CustomEvent('tribeJoined', { detail: { tokenId, newTribeSize: pet.tribeSize } }))
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Error joining tribe:', error)
    return false
  }
}
