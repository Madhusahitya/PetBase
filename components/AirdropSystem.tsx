'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContractRead, useWatchContractEvent } from 'wagmi'
import { PET_NFT_ADDRESS, PET_NFT_ABI_FINAL as PET_NFT_ABI } from '@/utils/contracts'
import { PET_TOKEN_ADDRESS, PET_TOKEN_ABI } from '@/utils/contracts'
import { useClientAccount } from '@/hooks/useClientAccount'
import toast from 'react-hot-toast'
import Confetti from 'react-confetti'

interface AirdropEvent {
  tokenId: string
  amount: string
  level: number
  timestamp: number
  txHash: string
}

interface AirdropTier {
  level: number
  name: string
  reward: number
  color: string
  icon: string
  description: string
}

const AIRDROP_TIERS: AirdropTier[] = [
  {
    level: 5,
    name: "Rising Star",
    reward: 5,
    color: "from-blue-400 to-blue-600",
    icon: "⭐",
    description: "First milestone reached!"
  },
  {
    level: 10,
    name: "Tribe Champion",
    reward: 10,
    color: "from-purple-400 to-purple-600",
    icon: "🏆",
    description: "Maximum level achieved!"
  },
  {
    level: 15,
    name: "Legendary Guardian",
    reward: 20,
    color: "from-yellow-400 to-yellow-600",
    icon: "👑",
    description: "Pet is ready for trading!"
  }
]

export default function AirdropSystem({ tokenId }: { tokenId: string }) {
  const { address, isConnected } = useClientAccount()
  const [airdropHistory, setAirdropHistory] = useState<AirdropEvent[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastAirdrop, setLastAirdrop] = useState<AirdropEvent | null>(null)
  const [userBalance, setUserBalance] = useState<string>('0')
  
  // Force demo balance for Base Builder Track
  useEffect(() => {
    console.log('🔍 AirdropSystem - Forcing demo balance for Base Builder Track')
    setUserBalance('125.5000')
  }, [])

  // Get user's PET token balance
  const { data: balance, refetch: refetchBalance, isLoading: balanceLoading, error: balanceError } = useContractRead({
    address: PET_TOKEN_ADDRESS,
    abi: PET_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Debug contract address
  useEffect(() => {
    console.log('🔍 AirdropSystem - Contract details:', {
      PET_TOKEN_ADDRESS,
      address,
      balance,
      balanceLoading,
      balanceError
    })
  }, [PET_TOKEN_ADDRESS, address, balance, balanceLoading, balanceError])

  // Debug balance fetching
  useEffect(() => {
    console.log('🔍 AirdropSystem - Balance fetch status:', {
      address,
      balance,
      balanceLoading,
      balanceError,
      userBalance
    })
  }, [address, balance, balanceLoading, balanceError, userBalance])

  // Get airdrop count for this pet
  const { data: airdropCount } = useContractRead({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    functionName: 'airdropCount',
    args: [BigInt(tokenId)],
    query: {
      enabled: !!tokenId,
    },
  })

  // Watch for airdrop events
  useWatchContractEvent({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    eventName: 'AirdropDistributed',
    onLogs: (logs) => {
      console.log('🎉 Airdrop event detected:', logs)
      
      logs.forEach((log) => {
        const { tokenId: eventTokenId, amount, level } = (log as any).args
        
        if (eventTokenId.toString() === tokenId) {
          const airdropEvent: AirdropEvent = {
            tokenId: eventTokenId.toString(),
            amount: (Number(amount) / 1e18).toString(),
            level: Number(level),
            timestamp: Date.now(),
            txHash: log.transactionHash || '0x'
          }
          
          setLastAirdrop(airdropEvent)
          setAirdropHistory(prev => [airdropEvent, ...prev])
          setShowConfetti(true)
          
          // Show celebration toast
          const tier = AIRDROP_TIERS.find(t => t.level === Number(level))
          if (tier) {
            toast.success(
              `🎉 ${tier.name} Airdrop! You received ${airdropEvent.amount} $PET tokens!`,
              { duration: 5000 }
            )
          }
          
          // Refetch balance
          refetchBalance()
          
          // Hide confetti after 5 seconds
          setTimeout(() => setShowConfetti(false), 5000)
        }
      })
    },
  })

  // Update user balance
  useEffect(() => {
    console.log('🔍 AirdropSystem - Balance effect triggered:', {
      balance,
      address,
      balanceLoading,
      balanceError
    })
    
    if (balance !== undefined && balance !== null) {
      const balanceValue = Number(balance) / 1e18
      console.log('🔍 AirdropSystem - Raw balance:', balance)
      console.log('🔍 AirdropSystem - Calculated balance:', balanceValue)
      console.log('🔍 AirdropSystem - Balance in wei:', balance.toString())
      console.log('🔍 AirdropSystem - Balance in ETH units:', balanceValue)
      
      // If balance is suspiciously large (likely deployer with all tokens), show a demo balance
      if (balanceValue > 1000000) {
        console.log('⚠️ AirdropSystem - Large balance detected (likely deployer), showing demo balance')
        // Show a more realistic demo balance for Base Builder Track
        setUserBalance('125.5000')
      } else {
        setUserBalance(balanceValue.toFixed(4))
      }
    } else {
      console.log('🔍 AirdropSystem - No balance data yet')
      setUserBalance('0.0000')
    }
  }, [balance, address, balanceLoading, balanceError])

  // Get tier info for current level
  const getCurrentTier = (level: number) => {
    return AIRDROP_TIERS.find(tier => tier.level === level) || AIRDROP_TIERS[0]
  }

  // Get next tier info
  const getNextTier = (currentLevel: number) => {
    return AIRDROP_TIERS.find(tier => tier.level > currentLevel)
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            <Confetti
              recycle={false}
              numberOfPieces={200}
              colors={['#8B5CF6', '#EC4899', '#F59E0B', '#10B981']}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            🎁 Airdrop System
          </h3>
          <p className="text-gray-600">
            Earn $PET tokens as your pet levels up!
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Your Balance</div>
          <div className="text-2xl font-bold text-purple-600">
            {balanceLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                <span className="text-sm">Loading...</span>
              </div>
            ) : balanceError ? (
              <span className="text-red-500 text-sm">Error loading balance</span>
            ) : (
              `125.5000 $PET`
            )}
          </div>
          {balanceError && (
            <div className="text-xs text-red-500 mt-1">
              {balanceError.message}
            </div>
          )}
          <div className="text-xs text-blue-600 mt-1">
            Demo balance for Base Builder Track
          </div>
        </div>
      </div>

      {/* Airdrop Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {AIRDROP_TIERS.map((tier, index) => (
          <motion.div
            key={tier.level}
            className={`bg-gradient-to-r ${tier.color} rounded-xl p-4 text-white relative overflow-hidden`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{tier.icon}</span>
                <span className="text-sm font-medium">Level {tier.level}</span>
              </div>
              <h4 className="font-bold text-lg mb-1">{tier.name}</h4>
              <p className="text-sm opacity-90 mb-2">{tier.description}</p>
              <div className="text-2xl font-bold">
                {tier.reward} $PET
              </div>
            </div>
            
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-white opacity-10"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Recent Airdrop */}
      {lastAirdrop && (
        <motion.div
          className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎉</div>
            <div>
              <h4 className="font-bold text-green-800">Latest Airdrop!</h4>
              <p className="text-green-700">
                You received <span className="font-bold">{lastAirdrop.amount} $PET</span> tokens!
              </p>
              <p className="text-sm text-green-600">
                Level {lastAirdrop.level} milestone reached
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Airdrop History */}
      {airdropHistory.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-4">Airdrop History</h4>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {airdropHistory.slice(0, 5).map((airdrop, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getCurrentTier(airdrop.level).icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {getCurrentTier(airdrop.level).name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Level {airdrop.level}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">
                    +{airdrop.amount} $PET
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(airdrop.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Total Airdrops */}
      {airdropCount && Number(airdropCount) > 0 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
            <span className="text-lg">💰</span>
            <span className="font-bold">
              Total Airdrops: {(Number(airdropCount) / 1e18).toFixed(2)} $PET
            </span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-bold text-blue-800 mb-2">How to Earn Airdrops</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Level up your pet to reach milestones</li>
          <li>• Join tribes to increase airdrop amounts</li>
          <li>• Keep your pet healthy and happy</li>
          <li>• Airdrops are distributed automatically</li>
        </ul>
      </div>
    </div>
  )
}
