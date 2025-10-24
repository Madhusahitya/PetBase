'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useClientAccount } from '@/hooks/useClientAccount'
import { useContractRead } from 'wagmi'
import { PET_TOKEN_ADDRESS, PET_TOKEN_ABI } from '@/utils/contracts'
import AirdropDashboard from '@/components/AirdropDashboard'
import OpenSeaMarketplace from '@/components/OpenSeaMarketplace'
import PageTransition from '@/components/PageTransition'
import RetroNavbar from '@/components/RetroNavbar'

function RewardsPageContent() {
  const { address, isConnected } = useClientAccount()
  const [mounted, setMounted] = useState(false)

  // Get user's PET token balance
  const { data: balance, isLoading: balanceLoading } = useContractRead({
    address: PET_TOKEN_ADDRESS,
    abi: PET_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="retro-game-ui min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="retro-text text-black">Loading rewards...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="retro-game-ui min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="retro-text text-2xl font-bold text-black mb-4">CONNECT YOUR WALLET</h2>
          <p className="retro-text text-black mb-6">Connect your wallet to view your airdrop rewards</p>
          <button
            onClick={() => window.location.href = '/'}
            className="retro-button"
          >
            GO HOME
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="retro-game-ui h-screen overflow-hidden flex flex-col">
      <RetroNavbar />
      <div className="container mx-auto px-4 py-4 flex-1 overflow-y-auto">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="text-6xl mb-4"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎁
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Airdrop Rewards
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Earn tokens by leveling up your pets and joining tribes. 
              Real rewards for real engagement!
            </p>
          </div>

          {/* Airdrop Dashboard */}
          <AirdropDashboard />

          {/* OpenSea Marketplace Section */}
          <div className="mt-12">
            <OpenSeaMarketplace />
          </div>

          {/* Features Section */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Why Our Rewards System is Special
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Instant Distribution</h3>
                <p className="text-gray-600">
                  Airdrops are distributed automatically when milestones are reached. 
                  No manual claiming required!
                </p>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Tribe Bonuses</h3>
                <p className="text-gray-600">
                  Join tribes to multiply your airdrop rewards. 
                  More tribe members = bigger payouts!
                </p>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Real Utility</h3>
                <p className="text-gray-600">
                  tokens have real utility in the ecosystem. 
                  Use them for pet upgrades and special features!
                </p>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">OpenSea Trading</h3>
                <p className="text-gray-600">
                  Sell your leveled-up pets on OpenSea with unique Base usernames. 
                  Turn your care into real ETH rewards!
                </p>
              </motion.div>
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
              <p className="text-lg mb-6 opacity-90">
                Create pets, level them up, and sell them on OpenSea with unique Base usernames!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => window.location.href = '/adopt'}
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Pet
                </motion.button>
                <motion.button
                  onClick={() => window.location.href = '/discover'}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join Tribes
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function RewardsPage() {
  return <RewardsPageContent />
}