'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import InteractivePet from '@/components/InteractivePet'
import RetroPetCare from '@/components/RetroPetCare'
import RetroNavbar from '@/components/RetroNavbar'
import PageTransition from '@/components/PageTransition'
import ClientOnly from '@/components/ClientOnly'
import { useClientAccount } from '@/hooks/useClientAccount'
import { useContractRead, useContractWrite, useWaitForTransactionReceipt, useWatchContractEvent, usePublicClient } from 'wagmi'
import { PET_NFT_ADDRESS, PET_NFT_ABI_FINAL as PET_NFT_ABI } from '@/utils/contracts'
import { PET_TOKEN_ADDRESS, PET_TOKEN_ABI } from '@/utils/contracts'
import toast from 'react-hot-toast'
import Confetti from 'react-confetti'
import BlockchainChat from '@/components/BlockchainChat'

function CarePageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const petId = useMemo(() => {
    const id = (params as any)?.petId as string | string[] | undefined
    if (typeof id === 'string') return id
    if (Array.isArray(id)) return id[0]
    return undefined
  }, [params])
  if (!petId) return null
  const { address, isConnected } = useClientAccount()

  // State for animations and UI
  const [taps, setTaps] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isLevelingUp, setIsLevelingUp] = useState(false)
  const [showAirdropAnimation, setShowAirdropAnimation] = useState(false)
  const [airdropAmount, setAirdropAmount] = useState(0)
  
  // Chat state
  const [showChat, setShowChat] = useState(false)
  const [tribeMembers, setTribeMembers] = useState<string[]>([])
  const [isTribeMember, setIsTribeMember] = useState(false)

  // Check for chat query parameter
  useEffect(() => {
    if (searchParams) {
      const chatParam = searchParams.get('chat')
      if (chatParam === 'true') {
        setShowChat(true)
      }
    }
  }, [searchParams])

  // Contract reads for pet stats
  const { data: petStats, refetch: refetchStats } = useContractRead({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    functionName: 'getPetStats',
    args: petId ? [BigInt(petId)] : undefined,
    query: {
      enabled: !!petId && isConnected,
    },
  })

  // Contract reads for PET token balance
  const { data: petBalance } = useContractRead({
    address: PET_TOKEN_ADDRESS,
    abi: PET_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Contract reads for airdrop count
  const { data: airdropCount } = useContractRead({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    functionName: 'airdropCount',
    args: petId ? [BigInt(petId)] : undefined,
    query: {
      enabled: !!petId && isConnected,
    },
  })

  // Contract reads for pet metadata
  const { data: petMetadata } = useContractRead({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    functionName: 'getPetMetadata',
    args: petId ? [BigInt(petId)] : undefined,
    query: {
      enabled: !!petId && isConnected,
    },
  })

  // Public client for contract calls
  const publicClient = usePublicClient()

  // Contract write for level up
  const { writeContract: levelUp, data: levelUpHash, error: levelUpError } = useContractWrite()
  const { isLoading: isConfirmingLevelUp, isSuccess: isLevelUpConfirmed } = useWaitForTransactionReceipt({
    hash: levelUpHash,
  })

  // Watch for LevelUp events
  useWatchContractEvent({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    eventName: 'LevelUp',
    onLogs: (logs: any[]) => {
      logs.forEach((log) => {
        const { tokenId, newLevel } = (log as any).args
        if (tokenId.toString() === petId) {
          console.log(`🎉 Pet ${petId} leveled up to level ${newLevel}!`)
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 5000)
          refetchStats()
        }
      })
    },
  })

  // Watch for AirdropDistributed events
  useWatchContractEvent({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    eventName: 'AirdropDistributed',
    onLogs: (logs: any[]) => {
      logs.forEach((log) => {
        const { tokenId, amount, level } = (log as any).args
        if (tokenId.toString() === petId) {
          console.log(`🎁 Airdrop distributed for pet ${petId}: ${amount} tokens at level ${level}!`)
          
          // Trigger airdrop animation
          setAirdropAmount(Number(amount) / 1e18)
          setShowAirdropAnimation(true)
          setTimeout(() => setShowAirdropAnimation(false), 3000)
          
          // Show success message
          const tierMessage = level === 5 ? '5 tokens' : level === 10 ? '10 tokens' : '20 tokens'
          toast.success(`🎁 Airdrop distributed! ${tierMessage} sent to tribe members!`, { duration: 5000 })
        }
      })
    },
  })

  // Watch for TribeJoined events
  useWatchContractEvent({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    eventName: 'TribeJoined',
    onLogs: (logs: any[]) => {
      logs.forEach((log) => {
        const { tokenId, user } = (log as any).args
        if (tokenId.toString() === petId) {
          console.log(`🎉 User ${user} joined tribe for pet ${petId}!`)
          // Refetch tribe members when someone joins
          fetchTribeMembers()
          
          // If current user joined, show chat option
          if (user.toLowerCase() === address?.toLowerCase()) {
            setIsTribeMember(true)
            toast.success('Welcome to the tribe! Chat is now available! 💬')
          }
        }
      })
    },
  })

  // Fetch tribe members
  const fetchTribeMembers = async () => {
    if (!petId) return
    
    // Demo pets are not supported - show error instead
    if (petId.startsWith('demo-')) {
      console.error('Demo pets are not supported in blockchain mode')
      setTribeMembers([])
      setIsTribeMember(false)
      return
    }
    
    try {
      if (!publicClient) {
        console.error('No public client available')
        return
      }

      // Fetch tribe members by checking each slot (max 10 members)
      const members: string[] = []
      for (let i = 0; i < 10; i++) {
        try {
          const member = await publicClient.readContract({
            address: PET_NFT_ADDRESS,
            abi: PET_NFT_ABI,
            functionName: 'tribeMembers',
            args: [BigInt(petId), BigInt(i)]
          }) as string
          
          if (member && member !== '0x0000000000000000000000000000000000000000') {
            members.push(member)
          }
        } catch (error) {
          // If we get an error, we've reached the end of the array
          break
        }
      }

      const validMembers = members

      setTribeMembers(validMembers)
      
      // Check if current user is a tribe member
      if (address) {
        const userIsMember = validMembers.some(member => 
          member.toLowerCase() === address.toLowerCase()
        )
        setIsTribeMember(userIsMember)
      }
      
      console.log(`🔍 Found ${validMembers.length} tribe members for pet ${petId}:`, validMembers)
      console.log('🔍 Current user address:', address)
      console.log('🔍 Is current user a tribe member:', isTribeMember)
      console.log('🔍 Setting tribeMembers state to:', validMembers)
    } catch (error) {
      console.error('Failed to fetch tribe members:', error)
      toast.error('Failed to load tribe members')
    }
  }

  // Fetch tribe members on mount and when petId changes
  useEffect(() => {
    if (mounted && petId) {
      fetchTribeMembers()
    }
  }, [mounted, petId, address])

  // Parse pet stats from contract
  const stats = petStats ? {
    health: Number((petStats as any)[0] || 0),
    happiness: Number((petStats as any)[1] || 0),
    level: Number((petStats as any)[2] || 0)
  } : { health: 80, happiness: 75, level: 1 }

  useEffect(() => {
    setMounted(true)
  }, [])

  const display = {
    health: Number(stats?.health ?? 0),
    happiness: Number(stats?.happiness ?? 0),
    level: Number(stats?.level ?? 0),
  }

  async function feed() {
    if (!address) return toast.error('Connect wallet')
    if (!petId) return toast.error('Invalid pet ID')
    
    if (petId.startsWith('demo-')) {
      return toast.error('Demo pets are not supported. Please create a new pet using the blockchain.')
    }
    
    try {
      toast.loading('Feeding pet...', { id: 'feed' })
      
      // TODO: Implement actual contract call for feeding
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Fed your pet! (Blockchain Mode)', { id: 'feed' })
    } catch (e: any) {
      toast.error('Feed failed', { id: 'feed' })
    }
  }

  async function play() {
    setTaps((t) => t + 1)
    if (taps + 1 >= 10) {
      setTaps(0)
      toast.success('Your pet is happier!')
    }
  }

  async function claimReward() {
    if (!address) return toast.error('Connect wallet')
    if (!petId) return toast.error('Invalid pet ID')
    if (display.level < 5) return toast.error('Reach level 5 to claim')
    
    if (petId.startsWith('demo-')) {
      return toast.error('Demo pets are not supported. Please create a new pet using the blockchain.')
    }
    
    try {
      toast.loading('Claiming reward...', { id: 'reward' })
      
      // TODO: Implement actual contract call for claiming rewards
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Reward distributed! (Blockchain Mode)', { id: 'reward' })
    } catch (e: any) {
      toast.error('Claim failed', { id: 'reward' })
    }
  }

  // Level up function with health check
  async function handleLevelUp() {
    if (!address) return toast.error('Connect wallet')
    if (!petId) return toast.error('Invalid pet ID')
    
    // Check health requirement
    if (stats.health <= 80) {
      return toast.error('Pet needs health > 80 to level up!')
    }
    
    // Demo pets are not supported
    if (petId.startsWith('demo-')) {
      return toast.error('Demo pets are not supported. Please create a new pet using the blockchain.')
    }
    
    try {
      setIsLevelingUp(true)
      toast.loading('Leveling up pet...', { id: 'level-up' })
      
      // Call the levelUp function on the contract
      levelUp({
        address: PET_NFT_ADDRESS,
        abi: PET_NFT_ABI,
        functionName: 'levelUp',
        args: [BigInt(petId)],
      })
    } catch (e: any) {
      console.error('Level up error:', e)
      toast.error('Level up failed', { id: 'level-up' })
      setIsLevelingUp(false)
    }
  }

  // Handle level up transaction confirmation
  useEffect(() => {
    if (isLevelUpConfirmed && levelUpHash) {
      console.log('Level up transaction confirmed:', levelUpHash)
      toast.success('Pet leveled up successfully! 🎉', { id: 'level-up' })
      setIsLevelingUp(false)
      refetchStats()
    }
  }, [isLevelUpConfirmed, levelUpHash, refetchStats])

  // Handle level up errors
  useEffect(() => {
    if (levelUpError) {
      console.error('Level up error:', levelUpError)
      toast.error('Level up failed: ' + (levelUpError.message || 'Unknown error'), { id: 'level-up' })
      setIsLevelingUp(false)
    }
  }, [levelUpError])

  // Parse pet metadata from contract
  const petType = petMetadata ? (petMetadata as any)[3] : 'puppy' // petType is the 4th element
  const petName = petMetadata ? (petMetadata as any)[1] : `Pet #${petId}` // name is the 2nd element
  
  const pet = {
    tokenId: String(petId),
    name: petName,
    health: display.health,
    happiness: display.happiness,
    level: display.level,
    traits: [],
    petType: petType as 'puppy' | 'kitten' | 'dragon',
  }

  // Framer Motion variants for pet growth animation
  const petVariants = {
    normal: { 
      scale: 1,
      transition: { duration: 0.5, type: 'spring' as const }
    },
    grown: { 
      scale: 1.2,
      transition: { duration: 0.5, type: 'spring' as const }
    },
    airdrop: {
      scale: [1, 1.2, 1],
      rotate: [0, 360, 0],
      transition: { 
        duration: 1.5, 
        type: 'spring' as const,
        times: [0, 0.5, 1]
      }
    }
  }

  return (
    <div className="retro-game-ui h-screen overflow-hidden flex flex-col">
      <RetroNavbar />
      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={200}
          width={typeof window !== 'undefined' ? window.innerWidth : 1920}
          height={typeof window !== 'undefined' ? window.innerHeight : 1080}
        />
      )}
      
      {/* Airdrop Coin Rain Animation */}
      {showAirdropAnimation && (
        <Confetti
          recycle={false}
          numberOfPieces={100}
          width={typeof window !== 'undefined' ? window.innerWidth : 1920}
          height={typeof window !== 'undefined' ? window.innerHeight : 1080}
          colors={['#FFD700', '#FFA500', '#FF8C00']}
          gravity={0.3}
          initialVelocityY={-10}
        />
      )}
      
      <div className="container mx-auto px-4 py-4 flex-1 overflow-y-auto">
        {!mounted ? (
          <div className="text-center py-12">Loading...</div>
        ) : petId && petId.startsWith('demo-') ? (
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-400 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-red-800 mb-4">Demo Pet Detected</h2>
              <p className="text-red-700 mb-4">
                This pet was created in demo mode. Please create a new pet using the blockchain to access all features.
              </p>
              <a 
                href="/adopt" 
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Create New Pet
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Retro Game-Style Pet Care Interface */}
              <RetroPetCare
                petType={pet.petType}
                level={display.level}
                health={display.health}
                happiness={display.happiness}
                onFeed={feed}
                onPlay={play}
                onLevelUp={handleLevelUp}
              />
              
              {/* Tribe Chat Button */}
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className={`game-button ${
                    isTribeMember 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-gray-400 hover:bg-gray-500'
                  }`}
                >
                  {showChat ? 'Close Chat' : 'Tribe Chat'} 💬
                  {!isTribeMember && ' (Join tribe first)'}
                </button>
                </div>
              </div>
            
            <div className="space-y-6">
              {/* Token Balance Card */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Token Balance</h3>
                <div className="text-2xl font-bold">{petBalance ? (Number(petBalance) / 1e18).toFixed(4) : '0.0000'}</div>
                <p className="text-gray-500 text-sm">Address: {address?.slice(0,6)}...{address?.slice(-4)}</p>
              </div>
              
              {/* Pet Stats Card */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Pet Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Health:</span>
                    <span className="font-semibold">{stats.health}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Happiness:</span>
                    <span className="font-semibold">{stats.happiness}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-semibold text-yellow-600">{stats.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Airdrops:</span>
                    <span className="font-semibold text-green-600">
                      {airdropCount ? (Number(airdropCount) / 1e18).toFixed(2) : '0.00'} PET
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Level 10 Special Notice */}
              {stats.level >= 10 && (
                <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-800">🎉 Level 10 Achieved!</h3>
                  <p className="text-yellow-700 text-sm">
                    Your pet has reached the maximum level! It can now be sold and you've earned 0.01 ETH!
                  </p>
                </div>
              )}

              {/* Enhanced Airdrop System */}
              <div className="mt-6">
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* XMTP Tribe Chat Component */}
      <BlockchainChat
        tokenId={petId}
        tribeMembers={tribeMembers}
        isVisible={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  )
}

export default function CarePage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PetPals...</p>
        </div>
      </div>
    }>
      <CarePageContent />
    </ClientOnly>
  )
}
