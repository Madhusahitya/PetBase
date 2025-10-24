'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InteractivePetProps {
  petType: 'puppy' | 'kitten' | 'dragon'
  level: number
  health: number
  happiness: number
  isDancing?: boolean
  isGrowing?: boolean
  onClick?: () => void
  className?: string
}

export default function InteractivePet({
  petType,
  level,
  health,
  happiness,
  isDancing = false,
  isGrowing = false,
  onClick,
  className = ''
}: InteractivePetProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isTapped, setIsTapped] = useState(false)
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>('neutral')

  // Determine pet mood based on stats
  useEffect(() => {
    if (happiness >= 80) setMood('happy')
    else if (happiness >= 50) setMood('neutral')
    else setMood('sad')
  }, [happiness])

  // Pet size based on level
  const petSize = Math.min(1 + (level - 1) * 0.1, 1.5)

  // Animation variants
  const petVariants = {
    idle: {
      scale: petSize,
      rotate: 0,
      transition: { duration: 0.3 }
    },
    dancing: {
      scale: petSize * 1.1,
      rotate: [0, -5, 5, -5, 5, 0],
      transition: { 
        duration: 0.6,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    },
    growing: {
      scale: [petSize, petSize * 1.3, petSize * 1.1],
      transition: { 
        duration: 1,
        times: [0, 0.5, 1]
      }
    },
    hover: {
      scale: petSize * 1.05,
      y: -5,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: petSize * 0.95,
      transition: { duration: 0.1 }
    }
  }

  // Eye animation based on mood
  const eyeVariants = {
    happy: { scaleY: 1, scaleX: 1 },
    neutral: { scaleY: 0.8, scaleX: 1 },
    sad: { scaleY: 0.6, scaleX: 0.8 }
  }

  // Tail wagging animation
  const tailVariants = {
    idle: { rotate: 0 },
    happy: { 
      rotate: [0, 20, -20, 20, -20, 0],
      transition: { 
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    },
    sad: { rotate: -10 }
  }

  const handleTap = () => {
    setIsTapped(true)
    setTimeout(() => setIsTapped(false), 150)
    onClick?.()
  }

  const renderPet = () => {
    const baseColor = mood === 'happy' ? '#FFD700' : mood === 'sad' ? '#87CEEB' : '#FFA500'
    const eyeColor = mood === 'happy' ? '#32CD32' : mood === 'sad' ? '#FF6B6B' : '#4169E1'

    if (petType === 'puppy') {
      return (
        <g>
          {/* Body */}
          <ellipse cx="50" cy="60" rx="25" ry="20" fill={baseColor} />
          
          {/* Head */}
          <circle cx="50" cy="35" r="18" fill={baseColor} />
          
          {/* Ears */}
          <ellipse cx="38" cy="25" rx="8" ry="12" fill={baseColor} transform="rotate(-20 38 25)" />
          <ellipse cx="62" cy="25" rx="8" ry="12" fill={baseColor} transform="rotate(20 62 25)" />
          
          {/* Eyes */}
          <motion.ellipse 
            cx="45" cy="30" rx="3" ry="4" fill={eyeColor}
            variants={eyeVariants}
            animate={mood}
          />
          <motion.ellipse 
            cx="55" cy="30" rx="3" ry="4" fill={eyeColor}
            variants={eyeVariants}
            animate={mood}
          />
          
          {/* Nose */}
          <ellipse cx="50" cy="38" rx="2" ry="1.5" fill="#000" />
          
          {/* Mouth */}
          <path 
            d={mood === 'happy' ? "M 45 42 Q 50 47 55 42" : 
               mood === 'sad' ? "M 45 45 Q 50 40 55 45" : 
               "M 45 43 Q 50 45 55 43"} 
            stroke="#000" 
            strokeWidth="1.5" 
            fill="none" 
          />
          
          {/* Tail */}
          <motion.ellipse 
            cx="75" cy="55" rx="15" ry="4" fill={baseColor}
            variants={tailVariants}
            animate={mood === 'happy' ? 'happy' : mood === 'sad' ? 'sad' : 'idle'}
          />
          
          {/* Legs */}
          <rect x="40" y="75" width="4" height="15" fill={baseColor} />
          <rect x="56" y="75" width="4" height="15" fill={baseColor} />
        </g>
      )
    }

    if (petType === 'kitten') {
      return (
        <g>
          {/* Body */}
          <ellipse cx="50" cy="60" rx="22" ry="18" fill={baseColor} />
          
          {/* Head */}
          <circle cx="50" cy="35" r="16" fill={baseColor} />
          
          {/* Ears */}
          <polygon points="40,20 35,35 45,30" fill={baseColor} />
          <polygon points="60,20 65,35 55,30" fill={baseColor} />
          
          {/* Inner ears */}
          <polygon points="42,25 38,35 45,30" fill="#FFB6C1" />
          <polygon points="58,25 62,35 55,30" fill="#FFB6C1" />
          
          {/* Eyes */}
          <motion.ellipse 
            cx="45" cy="30" rx="2.5" ry="3.5" fill={eyeColor}
            variants={eyeVariants}
            animate={mood}
          />
          <motion.ellipse 
            cx="55" cy="30" rx="2.5" ry="3.5" fill={eyeColor}
            variants={eyeVariants}
            animate={mood}
          />
          
          {/* Nose */}
          <ellipse cx="50" cy="38" rx="1.5" ry="1" fill="#FF69B4" />
          
          {/* Mouth */}
          <path 
            d={mood === 'happy' ? "M 47 42 Q 50 45 53 42" : 
               mood === 'sad' ? "M 47 45 Q 50 42 53 45" : 
               "M 47 43 Q 50 44 53 43"} 
            stroke="#000" 
            strokeWidth="1" 
            fill="none" 
          />
          
          {/* Tail */}
          <motion.path 
            d="M 72 55 Q 85 50 90 65 Q 85 70 75 60"
            stroke={baseColor}
            strokeWidth="6"
            fill="none"
            variants={tailVariants}
            animate={mood === 'happy' ? 'happy' : mood === 'sad' ? 'sad' : 'idle'}
          />
          
          {/* Legs */}
          <rect x="42" y="75" width="3" height="12" fill={baseColor} />
          <rect x="55" y="75" width="3" height="12" fill={baseColor} />
        </g>
      )
    }

    if (petType === 'dragon') {
      return (
        <g>
          {/* Body */}
          <ellipse cx="50" cy="60" rx="28" ry="22" fill={baseColor} />
          
          {/* Head */}
          <ellipse cx="50" cy="35" rx="20" ry="18" fill={baseColor} />
          
          {/* Horns */}
          <polygon points="45,15 40,25 50,20" fill="#8B4513" />
          <polygon points="55,15 60,25 50,20" fill="#8B4513" />
          
          {/* Wings */}
          <ellipse cx="25" cy="45" rx="15" ry="25" fill={baseColor} opacity="0.7" transform="rotate(-30 25 45)" />
          <ellipse cx="75" cy="45" rx="15" ry="25" fill={baseColor} opacity="0.7" transform="rotate(30 75 45)" />
          
          {/* Eyes */}
          <motion.ellipse 
            cx="45" cy="30" rx="4" ry="5" fill={eyeColor}
            variants={eyeVariants}
            animate={mood}
          />
          <motion.ellipse 
            cx="55" cy="30" rx="4" ry="5" fill={eyeColor}
            variants={eyeVariants}
            animate={mood}
          />
          
          {/* Nostrils */}
          <ellipse cx="47" cy="38" rx="1" ry="0.8" fill="#000" />
          <ellipse cx="53" cy="38" rx="1" ry="0.8" fill="#000" />
          
          {/* Mouth */}
          <path 
            d={mood === 'happy' ? "M 40 42 Q 50 47 60 42" : 
               mood === 'sad' ? "M 40 45 Q 50 40 60 45" : 
               "M 40 43 Q 50 45 60 43"} 
            stroke="#000" 
            strokeWidth="2" 
            fill="none" 
          />
          
          {/* Tail */}
          <motion.path 
            d="M 78 55 Q 95 50 105 70 Q 100 85 85 65"
            stroke={baseColor}
            strokeWidth="8"
            fill="none"
            variants={tailVariants}
            animate={mood === 'happy' ? 'happy' : mood === 'sad' ? 'sad' : 'idle'}
          />
          
          {/* Legs */}
          <rect x="35" y="75" width="6" height="18" fill={baseColor} />
          <rect x="59" y="75" width="6" height="18" fill={baseColor} />
        </g>
      )
    }

    return null
  }

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTap}
      whileHover="hover"
      whileTap="tap"
    >
      <motion.svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        className="w-full h-full"
        variants={petVariants}
        animate={
          isGrowing ? 'growing' :
          isDancing ? 'dancing' :
          isTapped ? 'tap' :
          isHovered ? 'hover' :
          'idle'
        }
      >
        {renderPet()}
      </motion.svg>
      
      {/* Level indicator */}
      {level > 1 && (
        <motion.div
          className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {level}
        </motion.div>
      )}
      
      {/* Health indicator */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 rounded-b-lg p-1">
        <div className="flex justify-between text-xs text-white">
          <span>❤️ {health}</span>
          <span>😊 {happiness}</span>
        </div>
      </div>
    </motion.div>
  )
}
