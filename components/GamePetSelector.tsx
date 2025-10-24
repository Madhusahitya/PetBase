'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PixelPet from './PixelPet'
import GameUI from './GameUI'

interface GamePetSelectorProps {
  onPetSelect: (petType: 'puppy' | 'kitten' | 'dragon') => void
  className?: string
}

const PET_OPTIONS = [
  {
    type: 'puppy' as const,
    name: 'PUPPY',
    description: 'Loyal companion',
    emoji: '🐕',
    color: '#8B4513'
  },
  {
    type: 'kitten' as const,
    name: 'KITTEN', 
    description: 'Playful explorer',
    emoji: '🐱',
    color: '#696969'
  },
  {
    type: 'dragon' as const,
    name: 'DRAGON',
    description: 'Majestic guardian',
    emoji: '🐉',
    color: '#228B22'
  }
]

export default function GamePetSelector({ onPetSelect, className = '' }: GamePetSelectorProps) {
  const [selectedPet, setSelectedPet] = useState<'puppy' | 'kitten' | 'dragon' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handlePetSelect = (petType: 'puppy' | 'kitten' | 'dragon') => {
    setSelectedPet(petType)
    setIsAnimating(true)
    
    setTimeout(() => {
      onPetSelect(petType)
    }, 1000)
  }

  return (
    <GameUI title="CHOOSE YOUR PET" className={className}>
      <div className="flex flex-col items-center space-y-8">
        {/* Pet Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {PET_OPTIONS.map((pet, index) => (
            <motion.div
              key={pet.type}
              className="game-card cursor-pointer"
              onClick={() => handlePetSelect(pet.type)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="text-center space-y-4">
                {/* Pet Preview */}
                <div className="flex justify-center">
                  <motion.div
                    animate={selectedPet === pet.type ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <PixelPet
                      petType={pet.type}
                      level={1}
                      health={80}
                      happiness={80}
                      className="w-24 h-24"
                    />
                  </motion.div>
                </div>

                {/* Pet Info */}
                <div className="space-y-2">
                  <h3 className="pixel-text text-2xl font-bold text-white">
                    {pet.name}
                  </h3>
                  <p className="pixel-text text-gray-300 text-sm">
                    {pet.description}
                  </p>
                </div>

                {/* Selection Indicator */}
                <motion.div
                  className="w-full h-2 rounded"
                  style={{ backgroundColor: pet.color }}
                  animate={selectedPet === pet.type ? {
                    scaleX: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5]
                  } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selection Animation */}
        <AnimatePresence>
          {isAnimating && selectedPet && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center space-y-6"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, 360, 0]
                  }}
                  transition={{ duration: 1 }}
                >
                  <PixelPet
                    petType={selectedPet}
                    level={1}
                    health={100}
                    happiness={100}
                    isDancing={true}
                    className="w-32 h-32"
                  />
                </motion.div>
                
                <motion.div
                  className="pixel-text text-4xl font-bold text-yellow-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  PET SELECTED!
                </motion.div>
                
                <motion.div
                  className="pixel-text text-white text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Creating your new companion...
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="text-center space-y-2">
          <p className="pixel-text text-gray-400 text-sm">
            Click on a pet to select it
          </p>
          <p className="pixel-text text-gray-500 text-xs">
            Each pet has unique traits and abilities
          </p>
        </div>
      </div>
    </GameUI>
  )
}
