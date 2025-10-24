'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PixelPet from './PixelPet'
import GameUI from './GameUI'

interface InteractivePetCareProps {
  petType: 'puppy' | 'kitten' | 'dragon'
  level: number
  health: number
  happiness: number
  onFeed?: () => void
  onPlay?: () => void
  onLevelUp?: () => void
  className?: string
}

export default function InteractivePetCare({
  petType,
  level,
  health,
  happiness,
  onFeed,
  onPlay,
  onLevelUp,
  className = ''
}: InteractivePetCareProps) {
  const [isDancing, setIsDancing] = useState(false)
  const [isGrowing, setIsGrowing] = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [showStars, setShowStars] = useState(false)
  const [playCount, setPlayCount] = useState(0)

  // Trigger dancing when happiness is high
  useEffect(() => {
    if (happiness > 80) {
      setIsDancing(true)
      const timer = setTimeout(() => setIsDancing(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [happiness])

  // Trigger growing animation on level up
  useEffect(() => {
    if (level > 1) {
      setIsGrowing(true)
      const timer = setTimeout(() => setIsGrowing(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [level])

  const handleFeed = () => {
    setShowHearts(true)
    setTimeout(() => setShowHearts(false), 2000)
    onFeed?.()
  }

  const handlePlay = () => {
    setShowStars(true)
    setTimeout(() => setShowStars(false), 2000)
    setPlayCount(prev => prev + 1)
    onPlay?.()
  }

  const handleLevelUp = () => {
    setIsGrowing(true)
    setTimeout(() => setIsGrowing(false), 2000)
    onLevelUp?.()
  }

  const canLevelUp = health > 80 && happiness > 80

  return (
    <GameUI title="PET CARE" className={className}>
      <div className="flex flex-col items-center space-y-6">
        {/* Interactive Pet */}
        <div className="relative">
          <motion.div
            className="relative"
            animate={{
              y: isDancing ? [-2, 2, -2, 2, 0] : 0,
              rotate: isDancing ? [-2, 2, -2, 2, 0] : 0
            }}
            transition={{
              duration: 0.5,
              repeat: isDancing ? Infinity : 0
            }}
          >
            <PixelPet
              petType={petType}
              level={level}
              health={health}
              happiness={happiness}
              isDancing={isDancing}
              isGrowing={isGrowing}
              className="w-32 h-32"
            />
          </motion.div>

          {/* Hearts animation */}
          <AnimatePresence>
            {showHearts && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-red-500 text-2xl"
                    initial={{ opacity: 0, y: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      y: -50 - i * 10, 
                      scale: [0, 1, 0],
                      x: (i - 2) * 20
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1
                    }}
                  >
                    ❤️
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Stars animation */}
          <AnimatePresence>
            {showStars && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-400 text-xl"
                    initial={{ opacity: 0, y: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      y: -30 - i * 15, 
                      scale: [0, 1, 0],
                      x: (i - 1) * 30
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.2
                    }}
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pet Stats */}
        <div className="w-full max-w-md space-y-4">
          {/* Health Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="pixel-text text-white text-sm">HEALTH</span>
              <span className="pixel-text text-red-400 text-sm font-bold">{health}%</span>
            </div>
            <div className="health-bar">
              <motion.div 
                className="health-fill"
                initial={{ width: 0 }}
                animate={{ width: `${health}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Happiness Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="pixel-text text-white text-sm">HAPPINESS</span>
              <span className="pixel-text text-yellow-400 text-sm font-bold">{happiness}%</span>
            </div>
            <div className="happiness-bar">
              <motion.div 
                className="happiness-fill"
                initial={{ width: 0 }}
                animate={{ width: `${happiness}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Level Display */}
          <div className="text-center">
            <span className="pixel-text text-yellow-400 text-lg font-bold">
              LEVEL {level}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <motion.button
            onClick={handleFeed}
            className="game-button flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🍎</span>
            <span>FEED</span>
          </motion.button>

          <motion.button
            onClick={handlePlay}
            className="game-button flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🎾</span>
            <span>PLAY ({playCount}/10)</span>
          </motion.button>
        </div>

        {/* Level Up Button */}
        {canLevelUp && (
          <motion.button
            onClick={handleLevelUp}
            className="game-button bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-lg px-8 py-4 w-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            🚀 LEVEL UP! 🚀
          </motion.button>
        )}

        {/* Status Messages */}
        <div className="text-center space-y-2">
          {health < 30 && (
            <motion.div
              className="pixel-text text-red-400 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⚠️ Pet needs care!
            </motion.div>
          )}
          
          {happiness > 80 && (
            <motion.div
              className="pixel-text text-green-400 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              😊 Pet is very happy!
            </motion.div>
          )}

          {canLevelUp && (
            <motion.div
              className="pixel-text text-yellow-400 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⭐ Ready to level up!
            </motion.div>
          )}
        </div>
      </div>
    </GameUI>
  )
}
