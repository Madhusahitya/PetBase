'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Pet {
  tokenId: string
  name: string
  health: number
  happiness: number
  level: number
  traits: string[]
  petType?: string
}

interface AnimatedPetCardProps {
  pet: Pet
  onClick?: () => void
  className?: string
}

export default function AnimatedPetCard({ pet, onClick, className = '' }: AnimatedPetCardProps) {
  const [mounted, setMounted] = useState(false)
  const { petType = 'puppy', happiness, level } = pet
  const isHappy = happiness > 50
  const isGrown = level >= 5

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`pet-card ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">{pet.name || `Pet #${pet.tokenId}`}</h3>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">ID: {pet.tokenId}</span>
        </div>
        <div className="flex justify-center mb-4">
          <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-6xl">🐾</div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }


  return (
    <motion.div
      className={`pet-card ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">{pet.name || `Pet #${pet.tokenId}`}</h3>
        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">ID: {pet.tokenId}</span>
      </div>

        {/* Animated Pet Sprite */}
        <div className="flex justify-center mb-4">
          <div className="w-48 h-48 relative">
            <motion.div
              className="w-full h-full bg-gradient-to-br from-blue-100 to-pink-100 rounded-lg flex items-center justify-center"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="text-6xl">
                {petType === 'puppy' ? '🐕' : petType === 'kitten' ? '🐱' : '🐉'}
              </div>
            </motion.div>
            {/* Evolution indicator */}
            {isGrown && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                ⭐ EVOLVED
              </div>
            )}
          </div>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm opacity-80">Health</div>
          <div className="text-2xl font-bold">{pet.health}</div>
          <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(pet.health, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm opacity-80">Happiness</div>
          <div className="text-2xl font-bold">{pet.happiness}</div>
          <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${isHappy ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${Math.min(pet.happiness, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm opacity-80">Level</div>
          <div className="text-2xl font-bold">{pet.level}</div>
          <div className="text-xs opacity-60">
            {pet.level >= 5 ? 'Evolved!' : `${5 - pet.level} to evolve`}
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm opacity-80">Traits</div>
          <div className="text-sm">{pet.traits?.length ? pet.traits.join(', ') : 'None'}</div>
        </div>
      </div>

      {/* Mood Indicator */}
      <div className="text-center mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
          isHappy ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
        }`}>
          {isHappy ? '😊 Happy' : '😢 Sad'}
        </div>
      </div>

      {onClick && (
        <motion.button 
          className="bg-white text-pet-blue font-bold py-2 px-4 rounded-lg w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Details
        </motion.button>
      )}
    </motion.div>
  )
}
