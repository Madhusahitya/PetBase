'use client'

import { motion } from 'framer-motion'

export default function AnimatedPuppy() {
  return (
    <motion.div
      className="relative w-48 h-48 mx-auto"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Puppy Body */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Head */}
        <div className="relative">
          <motion.div
            className="w-24 h-24 bg-amber-200 rounded-full border-4 border-amber-300"
            animate={{ 
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Eyes */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-black rounded-full"></div>
            <div className="absolute top-4 right-4 w-3 h-3 bg-black rounded-full"></div>
            
            {/* Nose */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full"></div>
            
            {/* Mouth */}
            <motion.div
              className="absolute top-10 left-1/2 transform -translate-x-1/2 w-8 h-4 border-b-2 border-black rounded-b-full"
              animate={{ 
                scaleX: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          {/* Ears */}
          <motion.div
            className="absolute -top-2 -left-2 w-8 h-12 bg-amber-300 rounded-full transform -rotate-12"
            animate={{ 
              rotate: [-12, -8, -12],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-12 bg-amber-300 rounded-full transform rotate-12"
            animate={{ 
              rotate: [12, 8, 12],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
      
      {/* Tail */}
      <motion.div
        className="absolute -right-8 top-1/2 transform -translate-y-1/2"
        animate={{ 
          rotate: [0, 30, -30, 0],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-16 h-4 bg-amber-300 rounded-full"></div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-amber-200 rounded-full"></div>
      </motion.div>
      
      {/* Paws */}
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2"
        animate={{ 
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-4 h-6 bg-amber-300 rounded-full"></div>
        <div className="w-4 h-6 bg-amber-300 rounded-full"></div>
      </motion.div>
    </motion.div>
  )
}
