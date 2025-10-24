'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContractRead } from 'wagmi'
import { PET_NFT_ADDRESS, PET_NFT_ABI_FINAL as PET_NFT_ABI } from '@/utils/contracts'
import { PET_TOKEN_ADDRESS, PET_TOKEN_ABI } from '@/utils/contracts'
import { useClientAccount } from '@/hooks/useClientAccount'
import toast from 'react-hot-toast'

interface AirdropStats {
  totalAirdrops: number
  totalValue: number
  userBalance: number
  nextMilestone: number
  progress: number
}

export default function AirdropDashboard() {
  const { address, isConnected } = useClientAccount()
  const [stats, setStats] = useState<AirdropStats>({
    totalAirdrops: 0,
    totalValue: 0,
    userBalance: 0,
    nextMilestone: 5,
    progress: 0
  })

  // Get user's PET token balance
  const { data: balance } = useContractRead({
    address: PET_TOKEN_ADDRESS,
    abi: PET_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Get total supply of PET tokens
  const { data: totalSupply } = useContractRead({
    address: PET_TOKEN_ADDRESS,
    abi: PET_TOKEN_ABI,
    functionName: 'totalSupply',
  })

  // Update stats
  useEffect(() => {
    if (balance && totalSupply) {
      const userBalance = Number(balance) / 1e18
      const totalSupplyValue = Number(totalSupply) / 1e18
      
      setStats(prev => ({
        ...prev,
        userBalance,
        totalValue: totalSupplyValue,
        progress: Math.min((userBalance / 100) * 100, 100) // Progress towards 100 PET
      }))
    }
  }, [balance, totalSupply])

  const milestones = [
    { level: 5, reward: 5, name: "Rising Star", color: "blue" },
    { level: 10, reward: 10, name: "Tribe Champion", color: "purple" },
    { level: 15, reward: 20, name: "Legendary Guardian", color: "yellow" }
  ]

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          className="text-6xl mb-4"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
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
          Airdrop Dashboard
        </h2>
        <p className="text-gray-600">
          Track your $PET token earnings and milestones
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* User Balance */}
        <motion.div
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">💰</div>
            <div>
              <h3 className="font-bold text-gray-800">Your Balance</h3>
              <p className="text-sm text-gray-600">$PET Tokens</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {stats.userBalance.toFixed(4)}
          </div>
        </motion.div>

        {/* Total Value */}
        <motion.div
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">🌍</div>
            <div>
              <h3 className="font-bold text-gray-800">Total Supply</h3>
              <p className="text-sm text-gray-600">All $PET Tokens</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalValue.toFixed(0)}
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">📈</div>
            <div>
              <h3 className="font-bold text-gray-800">Progress</h3>
              <p className="text-sm text-gray-600">To Next Milestone</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.progress.toFixed(1)}%
          </div>
        </motion.div>
      </div>

      {/* Milestones */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Airdrop Milestones</h3>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.level}
              className="bg-white rounded-xl p-4 border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-${milestone.color}-100 flex items-center justify-center text-2xl`}>
                    {milestone.level === 5 && '⭐'}
                    {milestone.level === 10 && '🏆'}
                    {milestone.level === 15 && '👑'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{milestone.name}</h4>
                    <p className="text-sm text-gray-600">Level {milestone.level} milestone</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {milestone.reward} $PET
                  </div>
                  <div className="text-sm text-gray-500">Reward</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">How Airdrops Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-800 mb-2">🎯 Automatic Distribution</h4>
            <p className="text-sm text-gray-600 mb-4">
              Airdrops are automatically distributed when your pet reaches milestone levels.
              No manual claiming required!
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-2">👥 Tribe Bonuses</h4>
            <p className="text-sm text-gray-600 mb-4">
              Join tribes to increase airdrop amounts. More tribe members = bigger rewards!
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-2">📈 Level-Based Rewards</h4>
            <p className="text-sm text-gray-600 mb-4">
              Higher levels unlock bigger airdrops. Level 15 pets get the maximum rewards!
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-2">💎 Real Value</h4>
            <p className="text-sm text-gray-600 mb-4">
              $PET tokens have real utility in the PetBase ecosystem. Use them for upgrades!
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-2">Start Earning Today!</h3>
          <p className="mb-4">Create a pet, join tribes, and start earning $PET tokens</p>
          <motion.button
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              toast.success('Navigate to Adopt page to create your first pet!')
            }}
          >
            Create Your Pet
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
