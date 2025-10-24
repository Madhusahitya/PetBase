'use client'

import { motion } from 'framer-motion'

interface Pet {
  tokenId: string
  name: string
  petType: 'puppy' | 'kitten' | 'dragon'
  health: number
  happiness: number
  level: number
  traits: string[]
  bio: string
  tribeSize: number
  maxTribeSize: number
  createdAt: number
  owner: string
}

interface PetTinderCardProps {
  pet: Pet
  onSwipe: (direction: 'left' | 'right') => void
  onJoinTribe: (pet: Pet) => void
}

export default function PetTinderCard({ pet, onSwipe, onJoinTribe }: PetTinderCardProps) {
  const isTribeFull = pet.tribeSize >= pet.maxTribeSize
  const canJoin = !isTribeFull && pet.tribeSize < pet.maxTribeSize

  return (
    <motion.div
      className="absolute w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Pet Image */}
      <div className="relative h-2/3 bg-gradient-to-br from-blue-100 to-pink-100 flex items-center justify-center">
        {(pet as any).image ? (
          <img
            src={(pet as any).image}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-8xl">
            {pet.petType === 'puppy' ? '🐕' : pet.petType === 'kitten' ? '🐱' : '🐉'}
          </div>
        )}
        
        {/* Overlay for tribe status */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isTribeFull 
              ? 'bg-red-500 text-white' 
              : canJoin 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-500 text-white'
          }`}>
            {isTribeFull ? 'Tribe Full' : `${pet.tribeSize}/${pet.maxTribeSize}`}
          </div>
        </div>

        {/* Swipe indicators */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-red-500 text-6xl font-bold opacity-0 transition-opacity duration-300" id="nope">
          NOPE
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-green-500 text-6xl font-bold opacity-0 transition-opacity duration-300" id="like">
          LIKE
        </div>
      </div>

      {/* Pet Info */}
      <div className="p-6 h-1/3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-800">{pet.name}</h2>
            <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">#{pet.tokenId}</span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{pet.bio}</p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-red-50 rounded-lg p-2">
              <div className="text-xs text-red-600 font-medium">Health</div>
              <div className="text-lg font-bold text-red-700">{pet.health}%</div>
              <div className="w-full bg-red-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${pet.health}%` }}
                />
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-2">
              <div className="text-xs text-yellow-600 font-medium">Happiness</div>
              <div className="text-lg font-bold text-yellow-700">{pet.happiness}%</div>
              <div className="w-full bg-yellow-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${pet.happiness}%` }}
                />
              </div>
            </div>
          </div>

          {/* Traits */}
          <div className="flex flex-wrap gap-1 mb-3">
            {pet.traits.map((trait, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={() => onSwipe('left')}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Skip
          </motion.button>
          
          <motion.button
            onClick={() => canJoin ? onJoinTribe(pet) : onSwipe('right')}
            disabled={!canJoin}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
              canJoin 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={canJoin ? { scale: 1.02 } : {}}
            whileTap={canJoin ? { scale: 0.98 } : {}}
          >
            {canJoin ? 'Join Tribe' : 'Tribe Full'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
