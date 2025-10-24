'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useClientAccount } from '@/hooks/useClientAccount'
import { useContractRead, usePublicClient } from 'wagmi'
import { PET_NFT_ADDRESS, PET_NFT_ABI_FINAL as PET_NFT_ABI } from '@/utils/contracts'
import { getAllPets, Pet } from '@/utils/petData'
import { useTribeStore } from '@/stores/tribeStore'
import PageTransition from '@/components/PageTransition'
import RetroPixelPet from '@/components/RetroPixelPet'
import RetroNavbar from '@/components/RetroNavbar'

function AlliancesPageContent() {
  const { address, isConnected } = useClientAccount()
  const [mounted, setMounted] = useState(false)
  const [joinedAlliances, setJoinedAlliances] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const publicClient = usePublicClient()
  
  // Zustand store for tribe state
  const { tribeMemberships } = useTribeStore()

  // Get user's pet balance
  const { data: balance } = useContractRead({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load joined alliances
  const loadJoinedAlliances = async () => {
    if (!publicClient || !address) {
      console.log('❌ No public client or address available')
      console.log('Public client:', !!publicClient)
      console.log('Address:', address)
      return
    }

    setIsLoading(true)
    try {
      console.log('🔄 Loading joined alliances...')
      console.log('Using contract address:', PET_NFT_ADDRESS)
      console.log('User address:', address)
      
      // Get all pets from blockchain
      const allPets = await getAllPets(publicClient)
      console.log('📦 Total pets found:', allPets.length)
      console.log('All pets:', allPets.map(p => ({ tokenId: p.tokenId, name: p.name, tribeMembers: p.tribeMembers })))
      
      // Filter pets where user is a tribe member
      const userAlliances = allPets.filter(pet => {
        if (!pet.tribeMembers || pet.tribeMembers.length === 0) {
          console.log(`Pet ${pet.tokenId} (${pet.name}) has no tribe members`)
          return false
        }
        
        // Check if user is in the tribe members array (case insensitive)
        const isMember = pet.tribeMembers.some(member => 
          member.toLowerCase() === address.toLowerCase()
        )
        
        console.log(`Checking pet ${pet.tokenId} (${pet.name}):`, {
          hasTribeMembers: !!pet.tribeMembers,
          tribeMembers: pet.tribeMembers,
          userAddress: address.toLowerCase(),
          isMember: isMember
        })
        
        return isMember
      })
      
      console.log('🤝 User alliances found:', userAlliances.length)
      console.log('User alliances:', userAlliances.map(p => ({ tokenId: p.tokenId, name: p.name })))
      setJoinedAlliances(userAlliances)
      
    } catch (error) {
      console.error('Error loading alliances:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load alliances when component mounts
  useEffect(() => {
    if (mounted && publicClient && address) {
      // Add a small delay to ensure publicClient is fully initialized
      const timer = setTimeout(() => {
      loadJoinedAlliances()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [mounted, publicClient, address])

  // Listen for tribe join events
  useEffect(() => {
    const handleTribeJoined = () => {
      console.log('🎉 Tribe joined event received, reloading alliances')
      loadJoinedAlliances()
    }
    
    const handlePetCreated = () => {
      console.log('🎉 Pet created event received, reloading alliances')
      loadJoinedAlliances()
    }
    
    window.addEventListener('tribeJoined', handleTribeJoined)
    window.addEventListener('petCreated', handlePetCreated)
    
    return () => {
      window.removeEventListener('tribeJoined', handleTribeJoined)
      window.removeEventListener('petCreated', handlePetCreated)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="retro-game-ui min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="retro-text text-2xl font-bold text-black mb-4">CONNECT YOUR WALLET</h2>
          <p className="retro-text text-black mb-6">Connect your wallet to view your alliances</p>
          <button
            onClick={() => router.push('/')}
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
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <div className="retro-title-box inline-block mb-2">
              <h1 className="retro-text text-2xl font-bold text-black">
                MY ALLIANCES
              </h1>
            </div>
          <p className="text-sm text-gray-600 mb-2">
              Pets you've joined tribes for
            </p>
          </div>

          {/* Content */}
          {isLoading ? (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Loading Your Alliances...
              </h2>
              <p className="text-gray-600">
                Fetching your tribe memberships from the blockchain
              </p>
        </motion.div>
          ) : joinedAlliances.length === 0 ? (
          <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
              <div className="text-6xl mb-4">🤝</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                No Alliances Yet!
              </h2>
            <p className="text-gray-600 mb-8">
                Start discovering pets and join their tribes to build your alliance network!
            </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => router.push('/discover')}
              className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                  Discover Pets
                </motion.button>
                <motion.button
                  onClick={() => router.push('/adopt')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Your Pet
            </motion.button>
              </div>
          </motion.div>
        ) : (
          <div className="flex flex-col md:flex-row gap-16 max-w-7xl mx-auto px-16 justify-center items-center">
              {joinedAlliances.map((pet, index) => (
              <motion.div
                  key={pet.tokenId}
                style={{
                  boxShadow: '8px 8px 0px #000',
                  background: '#EE3E3E',
                  border: '4px solid #000',
                  borderRadius: '12px',
                  padding: '32px',
                  margin: '20px',
                  color: '#000',
                  minHeight: '500px',
                  minWidth: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  maxWidth: '400px'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Retro Pixel Art Pet */}
                  <div className="text-center mb-6">
                    <div className="flex justify-center items-center mb-12 w-full">
                      <RetroPixelPet
                        petType={pet.petType}
                        level={pet.level}
                        health={pet.health}
                        happiness={pet.happiness}
                        isDancing={pet.happiness > 80}
                        isGrowing={pet.level > 5}
                        className="w-28 h-28 mx-auto"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2" style={{ fontFamily: 'Press Start 2P, Courier New, monospace', fontSize: '16px' }}>{pet.name}</h3>
                    <p className="text-lg text-black font-bold" style={{ fontFamily: 'Press Start 2P, Courier New, monospace', fontSize: '12px' }}>LEVEL {pet.level}</p>
                  </div>

                  {/* Pet Stats */}
                  <div className="space-y-4 mb-6 flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-black" style={{ fontSize: '8px' }}>HEALTH:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-4 border border-black">
                          <div 
                            className="bg-green-500 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${pet.health}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-black" style={{ fontSize: '8px' }}>{pet.health}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-black" style={{ fontSize: '8px' }}>HAPPINESS:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-4 border border-black">
                          <div 
                            className="bg-yellow-500 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${pet.happiness}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-black" style={{ fontSize: '8px' }}>{pet.happiness}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-black" style={{ fontSize: '8px' }}>TRIBE SIZE:</span>
                      <span className="text-sm font-bold text-black" style={{ fontSize: '8px' }}>{pet.tribeSize}/{pet.maxTribeSize}</span>
                    </div>
                  </div>

                  {/* Pet Traits */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {pet.traits.slice(0, 2).map((trait, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold border border-black"
                          style={{ fontSize: '8px' }}
                        >
                          {trait}
                        </span>
                      ))}
                  </div>
                </div>

                  {/* Action Button */}
                  <div className="flex justify-center">
                <motion.button
                      onClick={() => router.push(`/care/${pet.tokenId}`)}
                      style={{
                        boxShadow: '6px 6px 0px #000',
                        background: '#facc15',
                        border: '3px solid #000',
                        borderRadius: '10px',
                        color: '#000',
                        fontWeight: 'normal',
                        padding: '16px 32px',
                        width: '100%',
                        fontSize: '11px'
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
        </motion.div>
      </div>
    </div>
  )
}

export default function AlliancesPage() {
  return <AlliancesPageContent />
}