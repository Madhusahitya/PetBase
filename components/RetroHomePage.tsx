'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import RetroPixelPet from './RetroPixelPet'
import RetroGameUI from './RetroGameUI'

export default function RetroHomePage() {
  const router = useRouter()
  const [currentPet, setCurrentPet] = useState<'puppy' | 'kitten' | 'dragon'>('puppy')
  const [isAnimating, setIsAnimating] = useState(false)

  // Cycle through pets every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPet(prev => {
        const pets: ('puppy' | 'kitten' | 'dragon')[] = ['puppy', 'kitten', 'dragon']
        const currentIndex = pets.indexOf(prev)
        return pets[(currentIndex + 1) % pets.length]
      })
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const petNames = {
    puppy: 'BUDDY',
    kitten: 'WHISKERS', 
    dragon: 'FLAME'
  }

  return (
    <RetroGameUI title="" className="h-screen flex flex-col">
      <div className="retro-cursor flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center space-y-6">
          {/* Main Pet Display - Centered like reference */}
          <motion.div
            className="relative"
            animate={isAnimating ? {
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 0.8 }}
          >
            <RetroPixelPet
              petType={currentPet}
              level={5}
              health={85}
              happiness={90}
              isDancing={true}
              className="w-32 h-32"
            />
          </motion.div>

          {/* Pet Name */}
          <motion.div
            className="text-center"
            key={currentPet}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="retro-text text-3xl font-bold text-black mb-2">
              {petNames[currentPet]}
            </h2>
            <p className="retro-text text-lg text-black">
              LEVEL 5 • HEALTH 85% • HAPPINESS 90%
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <motion.button
              onClick={() => router.push('/adopt')}
              className="retro-button flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>➕</span>
              <span>ADOPT</span>
            </motion.button>

            <motion.button
              onClick={() => router.push('/discover')}
              className="retro-button flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🔍</span>
              <span>DISCOVER</span>
            </motion.button>
          </div>

          {/* Additional Options */}
          <div className="text-center space-y-2">
            <motion.button
              onClick={() => router.push('/alliances')}
              className="retro-button text-lg px-8 py-4 w-full max-w-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🤝</span>
              <span>MY ALLIANCES</span>
            </motion.button>

            <motion.button
              onClick={() => router.push('/rewards')}
              className="retro-button text-lg px-8 py-4 w-full max-w-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🎁</span>
              <span>REWARDS</span>
            </motion.button>
          </div>

          {/* Pet Type Selector */}
          <div className="flex gap-4">
            {(['puppy', 'kitten', 'dragon'] as const).map((petType) => (
              <motion.button
                key={petType}
                onClick={() => {
                  setCurrentPet(petType)
                  setIsAnimating(true)
                  setTimeout(() => setIsAnimating(false), 1000)
                }}
                className={`retro-button ${currentPet === petType ? 'bg-yellow-400' : 'bg-white'} text-sm px-4 py-2`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {petType.toUpperCase()}
              </motion.button>
            ))}
          </div>

          {/* Status Messages */}
          <div className="text-center space-y-2">
            <motion.div
              className="retro-text text-green-600 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎮 WELCOME TO PETBASE! 🎮
            </motion.div>
            <motion.div
              className="retro-text text-blue-600 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              CREATE • CARE • CONNECT
            </motion.div>
          </div>
        </div>
      </div>
    </RetroGameUI>
  )
}
