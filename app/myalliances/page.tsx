'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import AnimatedPetCard from '@/components/AnimatedPetCard'
import RetroNavbar from '@/components/RetroNavbar'
import ClientOnly from '@/components/ClientOnly'
import { useClientAccount } from '@/hooks/useClientAccount'
import { useContractRead, usePublicClient } from 'wagmi'
import { PET_NFT_ADDRESS, PET_NFT_ABI_FINAL as PET_NFT_ABI } from '@/utils/contracts'
import { useTribeStore } from '@/stores/tribeStore'
import { getAllPets, getDemoPetsFromLocalStorage } from '@/utils/petData'
import toast from 'react-hot-toast'

interface Pet {
  tokenId: string
  name: string
  petType: 'puppy' | 'kitten' | 'dragon'
  health: number
  happiness: number
  level: number
  traits: string[]
  bio: string
  tribeSize: number
  maxTribeSize: number
  createdAt: number
  owner: string
}

function MyAlliancesPageContent() {
  const { address, isConnected } = useClientAccount()
  const [mounted, setMounted] = useState(false)
  const [joinedAlliances, setJoinedAlliances] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const publicClient = usePublicClient()
  
  // Zustand store
  const { tribeMemberships, tribeMembers } = useTribeStore()

  // Get user's NFT balance
  const { data: balance, refetch: refetchBalance } = useContractRead({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Load user's joined alliances from blockchain
  const loadJoinedAlliances = useCallback(async () => {
    if (!address || !publicClient) {
      setJoinedAlliances([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      console.log('🔄 Loading joined alliances from blockchain...')
      
      const alliances: Pet[] = []
      
      // Get all pets from blockchain first
      const allPets = await getAllPets(publicClient)
      console.log('🔍 Total pets found:', allPets.length)
      console.log('🔍 All pets with tribe members:', allPets.map(p => ({
        tokenId: p.tokenId,
        name: p.name,
        tribeMembers: p.tribeMembers,
        tribeSize: p.tribeSize
      })))
      
      // Also check localStorage for demo pets
      const demoPets = await getDemoPetsFromLocalStorage()
      console.log('🔍 Demo pets found:', demoPets.length)
      
      // Combine blockchain and demo pets
      const allPetsCombined = [...allPets, ...demoPets]
      console.log('🔍 Total pets (blockchain + demo):', allPetsCombined.length)
      
      // Check each pet to see if user is in its tribe
      for (const pet of allPetsCombined) {
        // Skip pets owned by the user
        if (pet.owner.toLowerCase() === address.toLowerCase()) {
          console.log(`⏭️ Skipping own pet: ${pet.name} (${pet.tokenId})`)
          continue
        }
        
        // Handle demo pets differently
        if (pet.tokenId.startsWith('demo-')) {
          // For demo pets, check localStorage for tribe membership
          try {
            const tribeMemberships = JSON.parse(localStorage.getItem('petbase-tribe-memberships') || '{}')
            const isUserInTribe = tribeMemberships[pet.tokenId] === true
            
            if (isUserInTribe) {
              const alliancePet: Pet = {
                tokenId: pet.tokenId,
                name: pet.name,
                petType: pet.petType,
                health: pet.health,
                happiness: pet.happiness,
                level: pet.level,
                traits: pet.traits,
                bio: 'A wonderful pet looking for tribe members!',
                tribeSize: pet.tribeSize || 0,
                maxTribeSize: pet.maxTribeSize || 10,
                createdAt: Date.now(),
                owner: pet.owner,
              }
              
              alliances.push(alliancePet)
              console.log(`✅ User is in DEMO tribe for pet ${pet.name} (${pet.tokenId})`)
            } else {
              console.log(`❌ User NOT in DEMO tribe for pet ${pet.name} (${pet.tokenId})`)
            }
          } catch (error) {
            console.error(`Error checking demo tribe membership for pet ${pet.tokenId}:`, error)
          }
        } else {
          // For blockchain pets, check tribe membership using contract
          const isUserInTribe = await checkTribeMembership(pet)
            
            console.log(`🔍 Pet ${pet.name} (${pet.tokenId}) - checking tribe membership`)
            console.log(`Is user in tribe?`, isUserInTribe)
            
            if (isUserInTribe) {
              const alliancePet: Pet = {
                tokenId: pet.tokenId,
                name: pet.name,
                petType: pet.petType,
                health: pet.health,
                happiness: pet.happiness,
                level: pet.level,
                traits: pet.traits,
                bio: 'A wonderful pet looking for tribe members!',
                tribeSize: pet.tribeSize || 0,
                maxTribeSize: pet.maxTribeSize || 10,
                createdAt: Date.now(),
                owner: pet.owner,
              }
              alliances.push(alliancePet)
              console.log(`✅ User is in BLOCKCHAIN tribe for pet ${pet.name} (${pet.tokenId})`)
            } else {
              console.log(`❌ User NOT in BLOCKCHAIN tribe for pet ${pet.name} (${pet.tokenId})`)
            }
        }
      }
      
      console.log('🔍 Found joined alliances:', alliances.length)
      setJoinedAlliances(alliances)
      
    } catch (error) {
      console.error('Error loading joined alliances:', error)
      toast.error('Failed to load alliances')
      setJoinedAlliances([])
    } finally {
      setIsLoading(false)
    }
  }, [address, publicClient])

  // Check if user is in a tribe for a specific pet
  const checkTribeMembership = async (pet: any): Promise<boolean> => {
    if (!address || !publicClient) return false
    
    try {
      // Check each tribe member slot (max 10 members)
      for (let i = 0; i < 10; i++) {
        try {
          const member = await publicClient.readContract({
            address: PET_NFT_ADDRESS,
            abi: PET_NFT_ABI,
            functionName: 'tribeMembers',
            args: [BigInt(pet.tokenId), BigInt(i)]
          }) as string
          
          if (member && member !== '0x0000000000000000000000000000000000000000' && member.toLowerCase() === address.toLowerCase()) {
            return true
          }
        } catch (error) {
          // If we get an error, we've reached the end of the array
          break
        }
      }
      
      return false
    } catch (error) {
      console.error('Error checking tribe membership:', error)
      return false
    }
  }

  // Get demo pets from localStorage
  const getDemoPetsFromLocalStorage = async (): Promise<Pet[]> => {
    try {
      const stored = localStorage.getItem('petbase-created-pets')
      if (!stored) return []
      
      const storedPets = JSON.parse(stored)
      return storedPets.map((pet: any) => ({
        tokenId: pet.tokenId,
        name: pet.name,
        petType: pet.petType,
        health: pet.health,
        happiness: pet.happiness,
        level: pet.level,
        traits: pet.traits || ['Friendly', 'Energetic'],
        bio: pet.bio || 'A wonderful pet looking for tribe members!',
        tribeSize: pet.tribeSize || 1,
        maxTribeSize: pet.maxTribeSize || 10,
        createdAt: pet.createdAt || Date.now(),
        owner: pet.owner || 'unknown'
      }))
    } catch (error) {
      console.error('Error loading demo pets from localStorage:', error)
      return []
    }
  }


  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && address && publicClient) {
      loadJoinedAlliances()
    }
  }, [mounted, address, publicClient, loadJoinedAlliances])

  // Listen for tribe join events
  useEffect(() => {
    const handleTribeJoined = () => {
      console.log('🎉 Tribe joined event received, reloading alliances')
      loadJoinedAlliances()
    }
    
    window.addEventListener('tribeJoined', handleTribeJoined)
    return () => {
      window.removeEventListener('tribeJoined', handleTribeJoined)
    }
  }, [loadJoinedAlliances])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alliances...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="retro-game-ui min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="retro-text text-2xl font-bold text-black mb-4">CONNECT YOUR WALLET</h2>
          <p className="retro-text text-black mb-6">Connect your wallet to view your alliances!</p>
          <motion.button
            onClick={() => router.push('/')}
            className="retro-button text-lg px-8 py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            GO HOME
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="retro-game-ui h-screen overflow-hidden flex flex-col">
      <RetroNavbar />
      
      {/* Header */}
      <div className="text-center py-4">
        <div className="retro-title-box inline-block mb-2">
          <h1 className="retro-text text-2xl font-bold text-black">
            MY ALLIANCES
          </h1>
        </div>
        <p className="retro-text text-sm text-black">
          Pets you've joined tribes for
        </p>
      </div>

      <div className="container mx-auto px-6 py-8 flex-1 overflow-y-auto">

        {joinedAlliances.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white border-4 border-black rounded-lg p-8 text-center max-w-md mx-auto" style={{ boxShadow: '4px 4px 0px #000' }}>
              <div className="text-6xl mb-4">👥</div>
              <h2 className="retro-text text-2xl font-bold text-black mb-4">NO ALLIANCES YET</h2>
              <p className="retro-text text-black mb-6">
                Join some pet tribes to start building your alliance network!
              </p>
              <motion.button
                onClick={() => router.push('/discover')}
                className="retro-button text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                DISCOVER TRIBES
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 max-w-7xl mx-auto px-8">
            {joinedAlliances.map((alliance, index) => (
              <motion.div
                key={alliance.tokenId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{
                  boxShadow: '6px 6px 0px #000',
                  background: 'transparent',
                  border: '4px solid #00ff00',
                  borderRadius: '8px',
                  padding: '24px',
                  margin: '16px',
                  color: '#fff'
                }}
              >
                {/* Pet Display */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 flex items-center justify-center rounded-full border-2 border-black">
                      <img
                        src={`/pets/${alliance.petType === 'puppy' ? 'dog' : alliance.petType === 'kitten' ? 'cat' : 'dragon'}.png`}
                        alt={`${alliance.petType} pet`}
                        className="w-16 h-16 object-contain"
                        style={{
                          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                          imageRendering: 'auto'
                        }}
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'w-16 h-16 flex items-center justify-center text-4xl';
                          fallback.style.filter = 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))';
                          fallback.textContent = alliance.petType === 'puppy' ? '🐕' : alliance.petType === 'kitten' ? '🐱' : '🐉';
                          target.parentNode?.appendChild(fallback);
                        }}
                      />
                    </div>
                  </div>
                  <h3 className="mb-1 truncate" style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.125rem' }}>{alliance.name}</h3>
                  <p className="text-sm font-bold" style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.875rem' }}>LEVEL {alliance.level}</p>
                </div>

                {/* Pet Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold" style={{ color: '#fff', fontWeight: 'bold' }}>HEALTH:</span>
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-gray-200 rounded-full h-3 border border-black">
                        <div 
                          className="bg-red-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${alliance.health}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#fff', fontWeight: 'bold' }}>{alliance.health}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold" style={{ color: '#fff', fontWeight: 'bold' }}>HAPPINESS:</span>
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-gray-200 rounded-full h-3 border border-black">
                        <div 
                          className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${alliance.happiness}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#fff', fontWeight: 'bold' }}>{alliance.happiness}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold" style={{ color: '#fff', fontWeight: 'bold' }}>TRIBE SIZE:</span>
                    <span className="text-sm font-bold" style={{ color: '#10b981', fontWeight: 'bold' }}>{alliance.tribeSize}/{alliance.maxTribeSize}</span>
                  </div>
                </div>

                {/* Pet Traits */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {alliance.traits.slice(0, 2).map((trait, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold border border-black"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  <motion.button
                    onClick={() => router.push(`/care/${alliance.tokenId}`)}
                    className=""
                    style={{
                      boxShadow: '4px 4px 0px #000',
                      background: '#ef4444',
                      border: '2px solid #000',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: 'bold',
                      padding: '12px 24px',
                      width: '100%',
                      fontSize: '0.875rem'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ❤️ CARE PET
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MyAlliancesPage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PetPals...</p>
        </div>
      </div>
    }>
      <MyAlliancesPageContent />
    </ClientOnly>
  )
}
