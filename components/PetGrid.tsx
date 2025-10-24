'use client'

import PetCard from './PetCard'

interface Pet {
  tokenId: string
  name: string
  health: number
  happiness: number
  level: number
  traits: string[]
  imageUrl?: string
}

interface PetGridProps {
  pets: Pet[]
}

export default function PetGrid({ pets }: PetGridProps) {
  if (pets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🐾</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">No pets yet!</h3>
        <p className="text-gray-500">Adopt your first pet to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {pets.map((pet) => (
        <PetCard key={pet.tokenId} pet={pet} />
      ))}
    </div>
  )
}
