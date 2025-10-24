'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RetroPixelPet from './RetroPixelPet'
import RetroGameUI from './RetroGameUI'

interface RetroPetSelectorProps {
  onPetSelect: (petType: 'puppy' | 'kitten' | 'dragon') => void
  className?: string
}

const PET_OPTIONS = [
  {
    type: 'puppy' as const,
    name: 'PUPPY',
    description: 'Loyal companion',
    color: '#8B4513'
  },
  {
    type: 'kitten' as const,
    name: 'KITTEN', 
    description: 'Playful explorer',
    color: '#696969'
  },
  {
    type: 'dragon' as const,
    name: 'DRAGON',
    description: 'Majestic guardian',
    color: '#228B22'
  }
]

export default function RetroPetSelector({ onPetSelect, className = '' }: RetroPetSelectorProps) {
  const [selectedPet, setSelectedPet] = useState<'puppy' | 'kitten' | 'dragon' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handlePetSelect = (petType: 'puppy' | 'kitten' | 'dragon') => {
    setSelectedPet(petType)
    setIsAnimating(true)
    
    // Call onPetSelect immediately so the parent can update
    onPetSelect(petType)
    
    // Clear animation after shorter duration
    setTimeout(() => {
      setIsAnimating(false)
    }, 1000)
  }

  return (
    <div className={className}>
      <div className="retro-cursor">
        {/* Pet Selection Grid - Horizontal layout */}
        <div className="pet-grid max-w-6xl mx-auto">
          {PET_OPTIONS.map((pet, index) => (
            <motion.div
              key={pet.type}
              className={`pet-card ${selectedPet === pet.type ? 'selected' : ''}`}
              onClick={() => handlePetSelect(pet.type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="text-center space-y-2">
                {/* Pet Preview - Compact */}
                <div className="flex justify-center">
                  <motion.div
                    animate={selectedPet === pet.type ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 2, -2, 0]
                    } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <RetroPixelPet
                      petType={pet.type}
                      level={1}
                      health={80}
                      happiness={80}
                      className="w-36 h-36"
                    />
                  </motion.div>
                </div>

                {/* Pet Info - Much Bigger */}
                <div className="space-y-5">
                  <h3 className="retro-text text-3xl font-bold text-black">
                    {pet.name}
                  </h3>
                  <p className="retro-text text-xl text-gray-700">
                    {pet.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selection Animation - Non-blocking */}
        <AnimatePresence>
          {isAnimating && selectedPet && (
            <motion.div
              className="fixed top-4 right-4 bg-yellow-400 border-4 border-black rounded-lg p-4 z-50"
              style={{ boxShadow: '4px 4px 0px #000' }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="text-center space-y-2"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <RetroPixelPet
                    petType={selectedPet}
                    level={1}
                    health={100}
                    happiness={100}
                    isDancing={true}
                    className="w-12 h-12"
                  />
                </motion.div>
                
                <motion.div
                  className="retro-text text-sm font-bold text-black"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  SELECTED!
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
