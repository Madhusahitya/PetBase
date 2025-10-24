'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface RetroPixelPetProps {
  petType: 'puppy' | 'kitten' | 'dragon'
  level: number
  health: number
  happiness: number
  isDancing?: boolean
  isGrowing?: boolean
  className?: string
}

export default function RetroPixelPet({ 
  petType, 
  level, 
  health, 
  happiness, 
  isDancing = false, 
  isGrowing = false,
  className = '' 
}: RetroPixelPetProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  const [idleAnimation, setIdleAnimation] = useState(0)

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, Math.random() * 3000 + 2000)

    return () => clearInterval(blinkInterval)
  }, [])

  // Idle animation
  useEffect(() => {
    const idleInterval = setInterval(() => {
      setIdleAnimation(prev => (prev + 1) % 4)
    }, 2000)

    return () => clearInterval(idleInterval)
  }, [])

  const getPetDesign = () => {
    const pets = {
      puppy: {
        // White body with brown patches like reference
        bodyColor: '#FFFFFF',
        patchColor: '#8B4513', // Dark brown
        headColor: '#DEB887', // Light brown
        eyeColor: '#000000',
        noseColor: '#000000',
        mouthColor: '#000000'
      },
      kitten: {
        // Dark gray with light gray accents like reference
        bodyColor: '#696969', // Dark gray
        patchColor: '#D3D3D3', // Light gray
        headColor: '#D3D3D3', // Light gray
        eyeColor: '#000000',
        noseColor: '#000000',
        mouthColor: '#000000'
      },
      dragon: {
        // Green body with lime accents like reference
        bodyColor: '#228B22', // Green
        patchColor: '#32CD32', // Lime green
        headColor: '#32CD32', // Lime green
        eyeColor: '#FF0000', // Red
        noseColor: '#000000',
        mouthColor: '#FF0000' // Red
      }
    }

    return pets[petType] || pets.puppy
  }

  const petDesign = getPetDesign()

  // Animation variants - simple bobbing like reference
  const animationVariants = {
    idle: {
      y: [0, -3, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    happy: {
      y: [-6, 6, -6, 6, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatDelay: 1
      }
    },
    sad: {
      y: 2,
      scale: 0.95
    },
    dancing: {
      y: [-8, 8, -8, 8, 0],
      rotate: [-5, 5, -5, 5, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.6,
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

  const getAnimationState = () => {
    if (isDancing) return 'dancing'
    if (isGrowing) return 'growing'
    if (happiness > 80) return 'happy'
    if (health < 30) return 'sad'
    return 'idle'
  }

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      variants={animationVariants}
      animate={getAnimationState()}
    >
      {/* 3D Cartoonish Pet - Like original emoji pets */}
      <div 
        className="relative flex items-center justify-center"
        style={{
          width: '120px',
          height: '120px'
        }}
      >
        {/* 3D Cartoonish Pet Images */}
        <motion.div
          className="relative"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          animate={isBlinking ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.2 }}
        >
          <img
            src={`/pets/${petType === 'puppy' ? 'dog' : petType === 'kitten' ? 'cat' : 'dragon'}.png`}
            alt={`${petType} pet`}
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))',
              imageRendering: 'auto'
            }}
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'text-8xl';
              fallback.style.filter = 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))';
              fallback.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
              fallback.textContent = petType === 'puppy' ? '🐕' : petType === 'kitten' ? '🐱' : '🐉';
              target.parentNode?.appendChild(fallback);
            }}
          />
        </motion.div>
      </div>

      {/* Level indicator - Yellow circle like reference */}
      {level > 1 && (
        <div 
          className="absolute -top-2 -right-2 bg-yellow-400 text-black font-bold rounded-full flex items-center justify-center"
          style={{
            width: '20px',
            height: '20px',
            fontSize: '12px',
            border: '2px solid #000',
            boxShadow: '2px 2px 0px #000'
          }}
        >
          {level}
        </div>
      )}


      {/* Happiness sparkles */}
      {happiness > 80 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${15 + i * 25}%`,
                top: `${5 + i * 15}%`
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
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
