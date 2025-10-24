'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'

interface AirdropAnimationProps {
  isVisible: boolean
  amount: number
  tier: string
  onComplete: () => void
}

export default function AirdropAnimation({ isVisible, amount, tier, onComplete }: AirdropAnimationProps) {
  const [showCoins, setShowCoins] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowCoins(true)
      setShowConfetti(true)
      
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000)
      
      // Complete animation after 6 seconds
      setTimeout(() => {
        setShowCoins(false)
        onComplete()
      }, 6000)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Confetti
              recycle={false}
              numberOfPieces={300}
              colors={['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6']}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Animation */}
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-2xl"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            className="text-6xl mb-4"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🎁
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Airdrop Received!
          </h2>
          <p className="text-gray-600">
            Congratulations on reaching the {tier} milestone!
          </p>
        </div>

        {/* Amount Display */}
        <motion.div
          className="text-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6">
            <div className="text-4xl font-bold mb-2">
              +{amount} $PET
            </div>
            <div className="text-lg opacity-90">
              Tokens Added to Your Wallet
            </div>
          </div>
        </motion.div>

        {/* Animated Coins */}
        <AnimatePresence>
          {showCoins && (
            <div className="relative h-20 mb-6 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  initial={{ 
                    x: Math.random() * 300 - 150,
                    y: -50,
                    rotate: 0
                  }}
                  animate={{ 
                    y: 100,
                    rotate: 360,
                    x: Math.random() * 200 - 100
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  style={{
                    left: `${Math.random() * 100}%`
                  }}
                >
                  💰
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="text-sm text-gray-600 mb-2">Transaction Processing...</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, delay: 1 }}
            />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <div className="text-green-600 font-bold mb-2">
            ✅ Transaction Confirmed!
          </div>
          <p className="text-sm text-gray-600">
            Your $PET tokens have been added to your wallet
          </p>
        </motion.div>

        {/* Close Button */}
        <motion.button
          className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-bold"
          onClick={onComplete}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  )
}
