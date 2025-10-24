'use client'

interface Pet {
  tokenId: string
  name: string
  health: number
  happiness: number
  level: number
  traits: string[]
  imageUrl?: string
}

export default function PetCard({ pet }: { pet: Pet }) {
  return (
    <div className="pet-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">{pet.name || `Pet #${pet.tokenId}`}</h3>
        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">ID: {pet.tokenId}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm opacity-80">Health</div>
          <div className="text-2xl font-bold">{pet.health}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm opacity-80">Happiness</div>
          <div className="text-2xl font-bold">{pet.happiness}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm opacity-80">Level</div>
          <div className="text-2xl font-bold">{pet.level}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm opacity-80">Traits</div>
          <div className="text-sm">{pet.traits?.length ? pet.traits.join(', ') : 'None'}</div>
        </div>
      </div>

      <button className="bg-white text-pet-blue font-bold py-2 px-4 rounded-lg w-full">View Details</button>
    </div>
  )
}
