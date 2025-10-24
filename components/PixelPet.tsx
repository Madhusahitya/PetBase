'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface PixelPetProps {
  petType: 'puppy' | 'kitten' | 'dragon'
  level: number
  health: number
  happiness: number
  isDancing?: boolean
  isGrowing?: boolean
  className?: string
}

export default function PixelPet({ 
  petType, 
  level, 
  health, 
  happiness, 
  isDancing = false, 
  isGrowing = false,
  className = '' 
}: PixelPetProps) {
  const [animationState, setAnimationState] = useState<'idle' | 'happy' | 'sad' | 'dancing' | 'growing'>('idle')
  const [isBlinking, setIsBlinking] = useState(false)

  // Determine pet state based on stats
  useEffect(() => {
    if (isDancing) {
      setAnimationState('dancing')
    } else if (isGrowing) {
      setAnimationState('growing')
    } else if (happiness > 80) {
      setAnimationState('happy')
    } else if (health < 30) {
      setAnimationState('sad')
    } else {
      setAnimationState('idle')
    }
  }, [happiness, health, isDancing, isGrowing])

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, Math.random() * 3000 + 2000)

    return () => clearInterval(blinkInterval)
  }, [])

  // Pet size based on level
  const petSize = Math.min(8 + level * 2, 24) // 8x8 to 24x24 pixels
  const scale = petSize / 16 // Base size is 16x16

  const getPetPixels = () => {
    const basePixels = {
      puppy: [
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000'
      ],
      kitten: [
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000'
      ],
      dragon: [
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000'
      ]
    }

    return basePixels[petType] || basePixels.puppy
  }

  const getPetColors = () => {
    const colors = {
      puppy: {
        primary: '#8B4513', // Brown
        secondary: '#DEB887', // Light brown
        accent: '#FFD700', // Gold
        eye: '#000000', // Black
        nose: '#000000' // Black
      },
      kitten: {
        primary: '#696969', // Dark gray
        secondary: '#D3D3D3', // Light gray
        accent: '#FF69B4', // Pink
        eye: '#000000', // Black
        nose: '#000000' // Black
      },
      dragon: {
        primary: '#228B22', // Green
        secondary: '#32CD32', // Lime green
        accent: '#FF4500', // Red
        eye: '#FF0000', // Red
        nose: '#000000' // Black
      }
    }

    return colors[petType] || colors.puppy
  }

  const colors = getPetColors()
  const pixels = getPetPixels()

  // Animation variants
  const animationVariants = {
    idle: {
      y: 0,
      rotate: 0,
      scale: 1
    },
    happy: {
      y: [-2, 2, -2, 2, 0],
      rotate: [-2, 2, -2, 2, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 2
      }
    },
    sad: {
      y: 2,
      rotate: -5,
      scale: 0.95
    },
    dancing: {
      y: [-4, 4, -4, 4, 0],
      rotate: [-10, 10, -10, 10, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.3,
        repeat: Infinity
      }
    },
    growing: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.5,
        repeat: 3
      }
    }
  }

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      variants={animationVariants}
      animate={animationState}
      style={{ 
        width: `${petSize}px`, 
        height: `${petSize}px`,
        imageRendering: 'pixelated'
      }}
    >
      {/* Pixel Art Pet */}
      <div 
        className="relative"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated'
        }}
      >
        {/* Simple pixel art representation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="relative"
            style={{
              width: `${petSize}px`,
              height: `${petSize}px`,
              backgroundColor: colors.primary,
              borderRadius: '2px',
              border: '1px solid #000'
            }}
          >
            {/* Eyes */}
            <div 
              className="absolute"
              style={{
                top: `${petSize * 0.3}px`,
                left: `${petSize * 0.3}px`,
                width: `${petSize * 0.1}px`,
                height: `${petSize * 0.1}px`,
                backgroundColor: isBlinking ? colors.primary : colors.eye,
                borderRadius: '1px'
              }}
            />
            <div 
              className="absolute"
              style={{
                top: `${petSize * 0.3}px`,
                right: `${petSize * 0.3}px`,
                width: `${petSize * 0.1}px`,
                height: `${petSize * 0.1}px`,
                backgroundColor: isBlinking ? colors.primary : colors.eye,
                borderRadius: '1px'
              }}
            />
            
            {/* Nose */}
            <div 
              className="absolute"
              style={{
                top: `${petSize * 0.5}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                width: `${petSize * 0.08}px`,
                height: `${petSize * 0.08}px`,
                backgroundColor: colors.nose,
                borderRadius: '1px'
              }}
            />
            
            {/* Mouth */}
            <div 
              className="absolute"
              style={{
                top: `${petSize * 0.6}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                width: `${petSize * 0.2}px`,
                height: `${petSize * 0.05}px`,
                backgroundColor: colors.eye,
                borderRadius: '1px'
              }}
            />
            
            {/* Ears */}
            <div 
              className="absolute"
              style={{
                top: `${petSize * 0.1}px`,
                left: `${petSize * 0.2}px`,
                width: `${petSize * 0.15}px`,
                height: `${petSize * 0.2}px`,
                backgroundColor: colors.secondary,
                borderRadius: '1px',
                transform: 'rotate(-20deg)'
              }}
            />
            <div 
              className="absolute"
              style={{
                top: `${petSize * 0.1}px`,
                right: `${petSize * 0.2}px`,
                width: `${petSize * 0.15}px`,
                height: `${petSize * 0.2}px`,
                backgroundColor: colors.secondary,
                borderRadius: '1px',
                transform: 'rotate(20deg)'
              }}
            />
            
            {/* Tail */}
            <div 
              className="absolute"
              style={{
                bottom: `${petSize * 0.2}px`,
                right: `${petSize * 0.1}px`,
                width: `${petSize * 0.1}px`,
                height: `${petSize * 0.3}px`,
                backgroundColor: colors.secondary,
                borderRadius: '1px',
                transform: 'rotate(45deg)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Level indicator */}
      {level > 1 && (
        <div 
          className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center"
          style={{
            width: `${Math.max(16, petSize * 0.4)}px`,
            height: `${Math.max(16, petSize * 0.4)}px`,
            fontSize: `${Math.max(8, petSize * 0.3)}px`
          }}
        >
          {level}
        </div>
      )}

      {/* Health indicator */}
      <div 
        className="absolute -bottom-1 left-0 right-0 h-1 bg-red-500 rounded"
        style={{
          width: `${health}%`
        }}
      />

      {/* Happiness sparkles */}
      {happiness > 80 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
