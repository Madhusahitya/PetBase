'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import TinderCard from 'react-tinder-card'
import Confetti from 'react-confetti'
import { useClientAccount } from '@/hooks/useClientAccount'
import { useContractRead, useWatchContractEvent, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { PET_NFT_ADDRESS, PET_NFT_ABI_FINAL as PET_NFT_ABI } from '@/utils/contracts'
import { useTribeStore } from '@/stores/tribeStore'
import InteractivePet from '@/components/InteractivePet'
import RetroPixelPet from '@/components/RetroPixelPet'
import RetroNavbar from '@/components/RetroNavbar'
import { getAllPets, Pet } from '@/utils/petData'


function DiscoverPageContent() {
  const { address, isConnected } = useClientAccount()
  const [mounted, setMounted] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoadingPets, setIsLoadingPets] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isJoiningTribe, setIsJoiningTribe] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastChild, setLastChild] = useState<string | null>(null)
  const processedTransactions = useRef<Set<string>>(new Set())
  const router = useRouter()
  const publicClient = usePublicClient()
  
  // Zustand store for tribe state
  const { 
    tribeMemberships, 
    setTribeMembership, 
    addTribeMember, 
    setTribeMembers 
  } = useTribeStore()

  // Contract write functionality
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Wagmi hooks for contract interaction
  const { data: totalSupply, refetch: refetchTotalSupply } = useContractRead({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    functionName: 'totalSupply',
  })

  // Watch for new pets being minted
  useWatchContractEvent({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    eventName: 'PetMinted',
    onLogs: (logs: any[]) => {
      console.log('🎉 New pet minted on-chain! Refetching pets...', logs)
      refetchTotalSupply()
      fetchAllPets()
    },
  })

  // Watch for tribe join events
  useWatchContractEvent({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    eventName: 'TribeJoined',
    onLogs: (logs: any[]) => {
      console.log('🎉 TribeJoined event detected:', logs)
      logs.forEach((log) => {
        const { tokenId, user } = log.args
        const tokenIdStr = tokenId.toString()
        const userAddress = user as string
        
        console.log(`User ${userAddress} joined tribe for pet ${tokenIdStr}`)
        
        // Update Zustand store
        addTribeMember(tokenIdStr, userAddress)
        
        // If it's the current user, update membership status
        if (userAddress.toLowerCase() === address?.toLowerCase()) {
          setTribeMembership(tokenIdStr, true)
        }
        
        // Refetch tribe data for this specific pet
        refetchTribeData(tokenIdStr)
      })
    },
  })

  useEffect(() => {
    setMounted(true)
    console.log('🚀 Discover page mounted')
    
    // Test global event listener
    const testListener = (event: any) => {
      console.log('🧪 TEST: Global event received:', event.type, event.detail)
    }
    window.addEventListener('petCreated', testListener)
    
    return () => {
      window.removeEventListener('petCreated', testListener)
    }
  }, [])

  // Fetch pets using shared data fetching
  const fetchAllPets = useCallback(async () => {
    setIsLoadingPets(true)
    try {
      if (!publicClient) {
        console.log('❌ No public client available')
        setPets([])
        return
      }
      
      // Use shared data fetching function
      const allPets = await getAllPets(publicClient)
      console.log('🔍 Total pets loaded:', allPets.length)
      setPets(allPets)
      
      // Check tribe memberships for all pets
      await checkAllTribeMemberships()
      
    } catch (error) {
      console.error('Error fetching pets:', error)
      toast.error('Failed to load pets')
    } finally {
      setIsLoadingPets(false)
    }
  }, [publicClient])

  // Load pets when component mounts
  useEffect(() => {
    if (!mounted) return
    console.log('🔄 Loading pets on mount')
    fetchAllPets()
  }, [mounted, fetchAllPets]) // Add fetchAllPets dependency back

  // Listen for new pets created (demo mode)
  useEffect(() => {
    const handlePetCreated = (event: any) => {
      console.log('🎉 New demo pet created!', event.detail)
      console.log('Event detail:', event.detail)
      // Refetch all pets (both on-chain and demo)
      fetchAllPets()
      toast.success('New pet added!')
    }
    
    console.log('📡 Adding petCreated event listener')
    window.addEventListener('petCreated', handlePetCreated)
    return () => {
      console.log('📡 Removing petCreated event listener')
      window.removeEventListener('petCreated', handlePetCreated)
    }
  }, []) // Remove fetchAllPets dependency to prevent constant recreation

  // Check if user is already in a tribe
  const checkTribeMembership = async (pet: Pet): Promise<boolean> => {
    if (!address) return false
    
    // For blockchain pets, check contract
    if (!publicClient) return false
    
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

  // Refetch tribe data for a specific pet
  const refetchTribeData = useCallback(async (tokenId: string) => {
    if (!publicClient) return
    
    try {
      // Get updated tribe members by checking each slot
      const validMembers: string[] = []
      for (let i = 0; i < 10; i++) {
        try {
          const member = await publicClient.readContract({
            address: PET_NFT_ADDRESS,
            abi: PET_NFT_ABI,
            functionName: 'tribeMembers',
            args: [BigInt(tokenId), BigInt(i)]
          }) as string
          
          if (member && member !== '0x0000000000000000000000000000000000000000') {
            validMembers.push(member)
          }
        } catch (error) {
          // If we get an error, we've reached the end of the array
          break
        }
      }
      
      // Update Zustand store with new tribe members
      const memberObjects = validMembers.map(member => ({
        tokenId,
        user: member,
        joinedAt: Date.now() // We don't have exact join time from contract
      }))
      
      setTribeMembers(tokenId, memberObjects)
      
      // Update pets array with new tribe size
      setPets(prevPets => 
        prevPets.map(pet => 
          pet.tokenId === tokenId 
            ? { ...pet, tribeSize: validMembers.length }
            : pet
        )
      )
      
      console.log(`Updated tribe data for pet ${tokenId}: ${validMembers.length} members`)
    } catch (error) {
      console.error(`Error refetching tribe data for pet ${tokenId}:`, error)
    }
  }, [publicClient, setTribeMembers, setPets])

  // Check tribe memberships for all pets using already fetched data
  const checkAllTribeMemberships = async () => {
    if (!address || pets.length === 0) return
    
    const memberships: {[key: string]: boolean} = {}
    
    // Use already fetched tribe members data instead of making additional RPC calls
    pets.forEach((pet) => {
      let isMember = false
      
      if (pet.tribeMembers) {
        // For blockchain pets, use already fetched tribe members data
        isMember = pet.tribeMembers.includes(address)
      }
      
      memberships[pet.tokenId] = isMember
      setTribeMembership(pet.tokenId, isMember)
    })
    
    console.log('🔍 Tribe memberships checked using cached data:', memberships)
  }

  // Check memberships when pets change
  useEffect(() => {
    if (pets.length > 0 && address) {
      checkAllTribeMemberships()
    }
  }, [pets, address])

  // Check tribe size for a specific pet
  const checkTribeSize = async (tokenId: string): Promise<number> => {
    if (!publicClient) return 0
    
    try {
      // Check each tribe member slot (max 10 members)
      let count = 0
      for (let i = 0; i < 10; i++) {
        try {
          const member = await publicClient.readContract({
            address: PET_NFT_ADDRESS,
            abi: PET_NFT_ABI,
            functionName: 'tribeMembers',
            args: [BigInt(tokenId), BigInt(i)]
          }) as string
          
          if (member && member !== '0x0000000000000000000000000000000000000000') {
            count++
          }
        } catch (error) {
          // If we get an error, we've reached the end of the array
          break
        }
      }
      
      return count
    } catch (error) {
      console.error('Error checking tribe size:', error)
      return 0
    }
  }

  // Handle joining a tribe
  const joinTribe = async (pet: Pet) => {
    if (!address) {
      toast.error('Please connect your wallet to join a tribe')
      return
    }

    if (!isConnected) {
      toast.error('Wallet not connected')
      return
    }

    // Check if user is trying to join their own pet's tribe
    if (pet.owner.toLowerCase() === address.toLowerCase()) {
      toast.error("You can't join your own pet's tribe! You're already the owner! 👑", { id: 'join-tribe' })
      setCurrentIndex(prev => prev + 1)
      return
    }

    // All pets are now blockchain pets - no demo mode

    // Real blockchain pet - check if already in tribe
    const alreadyInTribe = await checkTribeMembership(pet)
    if (alreadyInTribe) {
      toast.error('You are already in this tribe!')
      setCurrentIndex(prev => prev + 1)
      return
    }

    // Check tribe size before attempting to join
    try {
      const tribeSize = await checkTribeSize(pet.tokenId)
      console.log(`Tribe size for pet ${pet.tokenId}: ${tribeSize}/10`)
      
      if (tribeSize >= 10) {
        toast.error('Tribe full! This tribe has reached the maximum of 10 members.', { id: 'join-tribe' })
        setCurrentIndex(prev => prev + 1)
        return
      }
    } catch (error) {
      console.error('Error checking tribe size:', error)
      toast.error('Failed to check tribe availability', { id: 'join-tribe' })
      setCurrentIndex(prev => prev + 1)
      return
    }

    try {
      setIsJoiningTribe(true)
      toast.loading('Joining tribe...', { id: 'join-tribe' })

      console.log('Joining blockchain tribe for pet:', pet.tokenId)
      
      writeContract({
          address: PET_NFT_ADDRESS,
          abi: PET_NFT_ABI,
          functionName: 'tribeJoin',
          args: [BigInt(pet.tokenId)],
        })

    } catch (error: any) {
      console.error('Error joining tribe:', error)
      let errorMessage = 'Failed to join tribe'
      
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled'
      } else if (error.message?.includes('Already in tribe')) {
        errorMessage = 'You are already in this tribe'
      } else if (error.message?.includes('Tribe is full')) {
        errorMessage = 'This tribe is full (max 10 members)'
      } else if (error.message?.includes('Pet does not exist')) {
        errorMessage = 'This pet no longer exists'
      }
      
      toast.error(errorMessage, { id: 'join-tribe' })
      setIsJoiningTribe(false)
    }
  }

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash && !processedTransactions.current.has(hash)) {
      console.log('Tribe join transaction confirmed:', hash)
      
      // Mark this transaction as processed to prevent infinite loops
      processedTransactions.current.add(hash)
      
      // Show confetti animation
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
      
      // Safely get the current pet before incrementing index
      const currentPet = pets[currentIndex]
      if (currentPet) {
        toast.success(
          (t) => (
            <div className="flex items-center gap-2">
              <span>Successfully joined {currentPet.name}'s tribe! 🎉</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id)
                  router.push('/myalliances')
                }}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                View My Alliances
              </button>
            </div>
          ),
          { id: 'join-tribe', duration: 8000 }
        )
        
        // Update Zustand store
        setTribeMembership(currentPet.tokenId, true)
        addTribeMember(currentPet.tokenId, address || '')
        
        // Store tribe membership in localStorage for backward compatibility
        try {
          const existingMemberships = JSON.parse(localStorage.getItem('petbase-tribe-memberships') || '{}')
          const updatedMemberships = {
            ...existingMemberships,
            [currentPet.tokenId]: true
          }
          localStorage.setItem('petbase-tribe-memberships', JSON.stringify(updatedMemberships))
          console.log('💾 Blockchain tribe membership saved to localStorage')
        } catch (error) {
          console.error('Error saving blockchain tribe membership:', error)
        }
        
        // Dispatch tribe joined event
        window.dispatchEvent(new CustomEvent('tribeJoined', { detail: { pet: currentPet } }))
        
        // Refetch tribe data for this specific pet
        refetchTribeData(currentPet.tokenId)
      } else {
        toast.success(
          (t) => (
            <div className="flex items-center gap-2">
              <span>Successfully joined tribe! 🎉</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id)
                  router.push('/myalliances')
                }}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                View My Alliances
              </button>
            </div>
          ),
          { id: 'join-tribe', duration: 8000 }
        )
      }
      
      setIsJoiningTribe(false)
      setCurrentIndex(prev => prev + 1)
    }
  }, [isConfirmed, hash])

  // Handle pet swiping with TinderCard
  const onSwipe = (direction: string, tokenId: string) => {
    console.log(`Swiped ${direction} on pet ${tokenId}`)
    const pet = pets.find(p => p.tokenId === tokenId)
    
    if (direction === 'right' && pet) {
      // Join tribe
      joinTribe(pet)
    } else if (pet) {
      // Skip pet
      toast(`Skipped ${pet.name}`, { id: 'skip-pet' })
      setCurrentIndex(prev => prev + 1)
    }
  }

  const onCardLeftScreen = (myIdentifier: string) => {
    console.log(`Card ${myIdentifier} left the screen`)
    setLastChild(myIdentifier)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PetBase...</p>
        </div>
      </div>
    )
  }

    return (
    <div className="retro-game-ui h-screen overflow-hidden flex flex-col">
      <RetroNavbar />
      {/* Confetti animation */}
      {mounted && showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        
        {/* Header */}
      <div className="text-center py-2">
        <div className="retro-title-box inline-block mb-2">
          <h1 className="retro-text text-2xl font-bold text-black">
            DISCOVER
          </h1>
        </div>
        <p className="retro-text text-sm text-black">
          Swipe to find your perfect pet tribe
        </p>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center flex-1 px-4">
        {isLoadingPets ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Loading Pet Tribes...
            </h2>
            <p className="text-gray-600">
              Fetching pets from the blockchain
            </p>
          </motion.div>
        ) : pets.length === 0 ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Pets Yet!
            </h2>
            <p className="text-gray-600 mb-8">
              Create your first pet to start building the PetBase community!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => router.push('/adopt')}
                className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your First Pet
              </motion.button>
              <motion.button
                onClick={() => {
                  console.log('Manual refresh clicked')
                  fetchAllPets()
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Refresh Pets
              </motion.button>
            </div>
          </motion.div>
        ) : currentIndex >= pets.length ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              You've seen all pets!
            </h2>
            <p className="text-gray-600 mb-8">
              Check back later for more pets or create your own.
            </p>
            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={() => {
                  setCurrentIndex(0)
                  fetchAllPets()
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Refresh
              </motion.button>
              <motion.button
                onClick={() => router.push('/adopt')}
                className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Pet
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="relative w-full max-w-md h-[500px]">
            {/* TinderCard stack */}
            <div className="relative w-full h-full">
              {pets.map((pet, index) => (
                <TinderCard
                  key={pet.tokenId}
                  onSwipe={(dir) => onSwipe(dir, pet.tokenId)}
                  onCardLeftScreen={() => onCardLeftScreen(pet.tokenId)}
                  preventSwipe={['up', 'down']}
                  className="absolute w-full h-full"
                >
                  <motion.div
                    className="w-full h-full p-4 flex flex-col"
                    style={{
                      background: '#facc15',
                      border: '4px solid #000',
                      borderRadius: '12px',
                      boxShadow: '6px 6px 0px #000'
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* 3D Pet Images */}
                    <div className="text-center mb-4">
                      <div className="flex justify-center mb-4">
                        <div className="w-40 h-40 flex items-center justify-center">
                          <img
                            src={`/pets/${pet.petType === 'puppy' ? 'dog' : pet.petType === 'kitten' ? 'cat' : 'dragon'}.png`}
                            alt={`${pet.petType} pet`}
                            className="w-full h-full object-contain"
                            style={{
                              filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.4))',
                              imageRendering: 'auto'
                            }}
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-full h-full flex items-center justify-center text-4xl';
                              fallback.style.filter = 'drop-shadow(4px 4px 8px rgba(0,0,0,0.4))';
                              fallback.textContent = pet.petType === 'puppy' ? '🐕' : pet.petType === 'kitten' ? '🐱' : '🐉';
                              target.parentNode?.appendChild(fallback);
                            }}
                          />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-black mb-2" style={{ fontFamily: 'Press Start 2P, Courier New, monospace', fontSize: '16px' }}>{pet.name}</h3>
                    </div>

                    {/* Pet stats */}
                    <div className="flex-1 space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-black" style={{ fontSize: '8px' }}>Health</span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${pet.health}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-black" style={{ fontSize: '8px' }}>{pet.health}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-black" style={{ fontSize: '8px' }}>Happiness</span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${pet.happiness}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-black" style={{ fontSize: '8px' }}>{pet.happiness}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-black" style={{ fontSize: '8px' }}>Level</span>
                        <span className="text-xs font-bold text-black" style={{ fontSize: '8px' }}>{pet.level}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-black" style={{ fontSize: '8px' }}>Tribe Size</span>
                        <span className="text-xs font-bold text-black" style={{ fontSize: '8px' }}>{pet.tribeSize}/{pet.maxTribeSize}</span>
                      </div>
                    </div>

                    {/* Pet traits */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {pet.traits.slice(0, 2).map((trait, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold border border-black"
                            style={{ fontSize: '7px' }}
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Pet bio */}
                    <p className="text-xs text-black mb-4 text-center italic" style={{ fontSize: '9px' }}>
                      "Looking for tribe members!"
                    </p>

                    {/* Status indicators */}
                    <div className="space-y-2 mb-4">
                
                {/* Owner indicator */}
                      {pet.owner.toLowerCase() === address?.toLowerCase() && (
                        <div className="bg-purple-500 border border-black text-white px-2 py-1 rounded-lg">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">👑</span>
                            <span className="font-semibold text-xs">YOURS!</span>
                    </div>
                  </div>
                )}
                
                {/* Tribe membership status */}
                      {tribeMemberships[pet.tokenId] && (
                        <div className="bg-green-500 border border-black text-white px-2 py-1 rounded-lg">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">✅</span>
                            <span className="font-semibold text-xs">IN TRIBE!</span>
                    </div>
                  </div>
                )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                  <button 
                        onClick={() => onSwipe('left', pet.tokenId)}
                    disabled={isJoiningTribe || isWritePending || isConfirming}
                        className="flex-1 game-button bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-3 font-semibold flex items-center justify-center gap-1 text-xs"
                  >
                        <span className="text-sm">❌</span>
                    PASS
                  </button>
                  <button 
                        onClick={() => onSwipe('right', pet.tokenId)}
                    disabled={
                      isJoiningTribe || 
                      isWritePending || 
                      isConfirming || 
                          tribeMemberships[pet.tokenId] ||
                          pet.owner.toLowerCase() === address?.toLowerCase()
                    }
                        className={`flex-1 game-button ${
                          tribeMemberships[pet.tokenId] || pet.owner.toLowerCase() === address?.toLowerCase()
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
                        } text-white px-3 py-3 font-semibold flex items-center justify-center gap-1 text-xs`}
                  >
                    {isJoiningTribe || isWritePending || isConfirming ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        {isWritePending ? 'SUBMIT...' : isConfirming ? 'CONFIRM...' : 'JOIN...'}
                      </>
                        ) : pet.owner.toLowerCase() === address?.toLowerCase() ? (
                      <>
                            <span className="text-sm">👑</span>
                        YOURS
                      </>
                        ) : tribeMemberships[pet.tokenId] ? (
                      <>
                            <span className="text-sm">✅</span>
                        IN TRIBE
                      </>
                    ) : (
                          <>
                            <span className="text-sm">❤️</span>
                            JOIN
                          </>
                    )}
                  </button>
                </div>
                  </motion.div>
                </TinderCard>
              ))}
              </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  return <DiscoverPageContent />
}
