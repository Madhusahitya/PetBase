'use client'

import { useEffect, useMemo, useState } from 'react'
import { PET_NFT_ABI_FINAL as PET_NFT_ABI, PET_NFT_ADDRESS, isContractDeployed } from '@/utils/contracts'

// Debug ABI import
console.log('PET_NFT_ABI in adopt page:', PET_NFT_ABI)
console.log('PET_NFT_ABI type:', typeof PET_NFT_ABI)
console.log('PET_NFT_ABI is array:', Array.isArray(PET_NFT_ABI))
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import ShareModal from '@/components/ShareModal'
import AnimatedPetCard from '@/components/AnimatedPetCard'
import RetroPetSelector from '@/components/RetroPetSelector'
import RetroPetCare from '@/components/RetroPetCare'
import RetroNavbar from '@/components/RetroNavbar'
import PageTransition from '@/components/PageTransition'
import ClientOnly from '@/components/ClientOnly'
import { useClientAccount } from '@/hooks/useClientAccount'
import { generateBasename } from '@/utils/basename'
import { generateBaseUsername, generateSocialShareText, generateShareableLink } from '@/utils/baseUsername'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import toast from 'react-hot-toast'

const PET_TYPES = [
  { 
    key: 'puppy', 
    label: 'Puppy', 
    emoji: '🐕',
    traits: ['Friendly', 'Energetic', 'Loyal'],
    description: 'A loyal companion who loves to play and make friends!'
  },
  { 
    key: 'kitten', 
    label: 'Kitten', 
    emoji: '🐱',
    traits: ['Curious', 'Independent', 'Cute'],
    description: 'An adventurous explorer with a playful spirit!'
  },
  { 
    key: 'dragon', 
    label: 'Dragon', 
    emoji: '🐉',
    traits: ['Majestic', 'Powerful', 'Wise'],
    description: 'A noble guardian with ancient wisdom and strength!'
  },
]

function AdoptPageContent() {
  const { isConnected, address } = useClientAccount()

  const [petType, setPetType] = useState(PET_TYPES[0].key)
  const [petName, setPetName] = useState('')
  const [health, setHealth] = useState(80)
  const [happiness, setHappiness] = useState(80)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [showShareModal, setShowShareModal] = useState(false)
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [petSpinTrigger, setPetSpinTrigger] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [baseUsername, setBaseUsername] = useState<string | null>(null)

  // Wagmi hooks for contract interaction
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt, error: confirmationError } = useWaitForTransactionReceipt({
    hash,
  })
  const connectedChainId = useChainId()

  const selected = useMemo(() => PET_TYPES.find(t => t.key === petType) || PET_TYPES[0], [petType])

  useEffect(() => {
    setMounted(true)
  }, [])



  // Handle successful transaction - only show UI feedback, don't set token ID yet
  useEffect(() => {
    if (isConfirmed && hash) {
      setShowConfetti(true)
      setPetSpinTrigger(true)
      setIsSubmitting(false)
      toast.success('Pet created successfully! 🎉')
      setTimeout(() => {
        setShowConfetti(false)
        setPetSpinTrigger(false)
      }, 5000)
    }
  }, [isConfirmed, hash])

  // Handle transaction errors and timeout
  useEffect(() => {
    if (isPending) {
      toast.loading('Creating pet on blockchain...', { id: 'mint-pet' })
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (isPending) {
          setIsSubmitting(false)
          setError('Transaction is taking too long. Please try again.')
          toast.error('Transaction timeout. Please try again.', { id: 'mint-pet' })
        }
      }, 60000) // 60 seconds timeout
      
      return () => clearTimeout(timeout)
    }
  }, [isPending])

  async function createPet() {
    try {
      setError(undefined)
      
      if (!petName || !petName.trim()) {
        setError('Please enter a pet name')
        return
      }
      
      if (!address) {
        setError('Please connect your wallet')
        return
      }

      // Contract must be deployed for real blockchain interactions
      if (!isContractDeployed()) {
        setError('PetNFT contract is not deployed. Please check your network configuration.')
        return
      }

      setIsSubmitting(true)
      toast.loading('Creating your pet on the blockchain...', { id: 'mint-pet' })
      
      try {
        console.log('Creating pet on-chain:', { petName, health, happiness, petType })
        console.log('Wallet status:', { isConnected, address, chainId: connectedChainId })
        console.log('Contract details:', { address: PET_NFT_ADDRESS, abiLength: PET_NFT_ABI?.length || 0 })
        
        // Check if wallet is properly connected
        if (!isConnected || !address) {
          throw new Error('Wallet not properly connected')
        }
        
        // Check if we're on the correct network (Base Sepolia, id 84532)
        if (connectedChainId && connectedChainId !== 84532) {
          throw new Error('Please switch to Base Sepolia network')
        }
        
        // Check if ABI is loaded
        if (!PET_NFT_ABI || !Array.isArray(PET_NFT_ABI) || PET_NFT_ABI.length === 0) {
          console.error('ABI Debug Info:', {
            PET_NFT_ABI,
            isArray: Array.isArray(PET_NFT_ABI),
            length: PET_NFT_ABI?.length,
            type: typeof PET_NFT_ABI
          })
          throw new Error('Contract ABI not loaded. Please refresh the page.')
        }
        
        // Check if contract address is valid
        if (!PET_NFT_ADDRESS || PET_NFT_ADDRESS === '0x0000000000000000000000000000000000000000') {
          throw new Error('Contract address not configured. Please check your environment variables.')
        }
        
        console.log('Calling writeContract with:', {
          address: PET_NFT_ADDRESS,
          functionName: 'mintPet',
          args: [address, petName, BigInt(health), BigInt(happiness), BigInt(1)],
        })
        
        writeContract({
          address: PET_NFT_ADDRESS,
          abi: PET_NFT_ABI,
          functionName: 'mintPet',
          args: [
            address, // to
            petName, // name
            BigInt(health), // health
            BigInt(happiness), // happiness
            BigInt(1) // level
          ],
        })

        console.log('Transaction submitted successfully')
        toast.loading('Transaction submitted! Waiting for confirmation...', { id: 'mint-pet' })
        
      } catch (error: any) {
        console.error('Error creating pet:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          data: error.data,
          reason: error.reason
        })
        
        let errorMessage = 'Failed to create pet'
        
        if (error.message?.includes('User rejected') || error.code === 4001) {
          errorMessage = 'Transaction was cancelled by user'
        } else if (error.message?.includes('insufficient funds') || error.code === -32603) {
          errorMessage = 'Insufficient funds for transaction'
        } else if (error.message?.includes('execution reverted')) {
          errorMessage = `Transaction failed: ${error.reason || 'Contract execution reverted'}`
        } else if (error.message?.includes('timeout')) {
          errorMessage = 'Transaction timed out - please try again'
        } else if (error.message?.includes('no hash returned')) {
          errorMessage = 'Transaction failed to submit - please check your wallet connection'
        } else if (error.message?.includes('Base Sepolia')) {
          errorMessage = 'Please switch to Base Sepolia network in your wallet'
        } else if (error.code === 4902) {
          errorMessage = 'Please switch to Base Sepolia network'
        } else {
          errorMessage = `Failed to create pet: ${error.message || 'Unknown error'}`
        }
        
        setError(errorMessage)
        toast.error(errorMessage, { id: 'mint-pet' })
        
      }
    } catch (error: any) {
      console.error('Error in createPet:', error)
      setError(error?.message || 'An unexpected error occurred')
      setIsSubmitting(false)
      toast.error('Failed to create pet', { id: 'mint-pet' })
    }
  }

  // Handle transaction confirmation
  useEffect(() => {
    console.log('Transaction status:', { isConfirmed, isConfirming, receipt: !!receipt, hash, confirmationError })
    
    // Handle transaction revert/error
    if (confirmationError) {
      console.error('Transaction failed:', confirmationError)
      setIsSubmitting(false)
      setError(`Transaction failed: ${confirmationError.message || 'Unknown error'}`)
      toast.error(`Transaction failed: ${confirmationError.message || 'Unknown error'}`, { id: 'mint-pet' })
      return
    }
    
    // Add timeout for stuck transactions
    if (hash && !isConfirmed && !isConfirming && !confirmationError) {
      const timeout = setTimeout(() => {
        console.log('Transaction timeout - may have failed')
        toast.error('Transaction timed out. Please check your wallet or try again.', { id: 'mint-pet' })
        setIsSubmitting(false)
      }, 60000) // 60 second timeout
      
      return () => clearTimeout(timeout)
    }
    
    if (isConfirmed && receipt) {
      console.log('Pet minted successfully!', receipt)
      setIsSubmitting(false) // Transaction confirmed, stop loading
      
      // Get the token ID from the transaction logs
      const transferLog = receipt.logs.find((log: any) => 
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event
      )
      
      if (transferLog && transferLog.topics && transferLog.topics[3]) {
        try {
          const tokenIdHex = transferLog.topics[3]
          const tokenIdBigInt = BigInt(tokenIdHex)
          const tokenIdString = tokenIdBigInt.toString()
          setMintedTokenId(tokenIdString)
          
          // Generate Base username for the pet
          const username = generateBaseUsername(petName, petType, tokenIdString)
          setBaseUsername(username)
          
          toast.success(`Pet created successfully! 🎉\nBase Username: ${username}`, { 
            id: 'mint-pet',
            duration: 8000 
          })
          
          // Pet is now on the blockchain - discover page will fetch it automatically
          console.log('Pet minted successfully on blockchain with token ID:', tokenIdString)
          console.log('Base Username generated:', username)
          
          // Trigger a custom event to notify discover page to refetch data
          console.log('📡 Dispatching petCreated event to trigger data refresh')
          window.dispatchEvent(new CustomEvent('petCreated', { 
            detail: { 
              tokenId: tokenIdString,
              baseUsername: username,
              petName: petName,
              petType: petType
            } 
          }))
        } catch (error) {
          console.error('Error parsing token ID:', error)
          toast.error('Pet created but could not determine token ID', { id: 'mint-pet' })
        }
      } else {
        console.error('Could not find Transfer event in transaction logs')
        console.log('Available logs:', receipt.logs)
        toast.error('Pet created but could not determine token ID from transaction logs', { id: 'mint-pet' })
      }
    }
  }, [isConfirmed, receipt, petName, petType, health, happiness, selected, address])

  return (
    <div className="retro-game-ui h-screen overflow-hidden flex flex-col">
      <RetroNavbar />
      {mounted && showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="container mx-auto px-4 py-4 flex-1 overflow-y-auto">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <p className="retro-text text-sm text-black">
              Choose your perfect companion
            </p>
            
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Design your perfect companion and bring them to life on the blockchain
            </p>
          </div>

          {!isConnected ? (
            <motion.div
              className="bg-white border-4 border-black rounded-lg p-6 text-center"
              style={{ boxShadow: '4px 4px 0px #000' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-4">🔗</div>
              <h2 className="retro-text text-2xl font-bold text-black mb-3">CONNECT WALLET</h2>
              <p className="retro-text text-black mb-6 text-sm">Connect your wallet to start your pet adventure!</p>
              <div className="transform scale-110">
                <ConnectButton />
              </div>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Compact Pet Selection */}
              <RetroPetSelector
                onPetSelect={(selectedPetType) => {
                  setPetType(selectedPetType)
                  // Auto-generate a name based on pet type
                  const names = {
                    puppy: ['Buddy', 'Max', 'Luna', 'Charlie', 'Bella'],
                    kitten: ['Whiskers', 'Shadow', 'Mittens', 'Tiger', 'Smokey'],
                    dragon: ['Flame', 'Storm', 'Crystal', 'Thunder', 'Ember']
                  }
                  const randomName = names[selectedPetType][Math.floor(Math.random() * names[selectedPetType].length)]
                  setPetName(randomName)
                }}
              />
              
              {/* Pet Name Input - Compact */}
              <motion.div
                className="mt-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-white border-4 border-black rounded-lg p-3 text-center" style={{ boxShadow: '4px 4px 0px #000' }}>
                  <h3 className="text-lg font-bold text-black mb-2" style={{ fontFamily: 'Inter, sans-serif', textShadow: '2px 2px 0px #000' }}>
                    NAME YOUR COMPANION
                  </h3>
                  <input
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full max-w-md mx-auto bg-white border-3 border-black rounded p-2 text-black text-center text-sm font-bold"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      boxShadow: '2px 2px 0px #000'
                    }}
                    placeholder="Enter pet name..."
                    maxLength={20}
                  />
                </div>
              </motion.div>

              {/* Create Button - Compact */}
              <motion.div
                className="mt-3 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <motion.button
                  onClick={createPet}
                  disabled={isSubmitting || isPending || !petName.trim()}
                  className="bg-yellow-400 border-4 border-black rounded-lg px-6 py-3 text-black text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: '4px 4px 0px #000',
                    textShadow: '2px 2px 0px #000'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {(isSubmitting || isPending) && (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2" />
                  )}
                  {isSubmitting || isPending ? 'CREATING...' : 'CREATE COMPANION'}
                </motion.button>

                {error && (
                  <motion.div
                    className="mt-4 p-4 bg-red-600 border-2 border-red-800 rounded-lg text-white pixel-text"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                    <button
                      onClick={() => {
                        setError(undefined)
                        setIsSubmitting(false)
                        setMintedTokenId(null)
                      }}
                      className="ml-2 text-yellow-300 underline hover:text-yellow-100"
                    >
                      RESET
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}

          {/* Success State */}
          {mintedTokenId && (
            <motion.div
              className="mt-8 bg-white rounded-2xl shadow-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Pet is Live!</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Others can swipe right to join your alliance and help care for your pet!
                </p>
              </div>

              <div className="max-w-md mx-auto mb-6">
                <AnimatedPetCard
                  pet={{
                    tokenId: mintedTokenId,
                    name: petName,
                    health: health,
                    happiness: happiness,
                    level: 1,
                    traits: selected?.traits || [],
                    petType: petType,
                  }}
                />
              </div>

              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-4">
                  Basename: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{generateBasename(petName, mintedTokenId)}</span>
                </div>
                {baseUsername && (
                  <div className="text-sm text-blue-600 mb-4">
                    <span className="font-bold">Base Username:</span> 
                    <span className="font-mono bg-blue-100 px-2 py-1 rounded ml-2">{baseUsername}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => setShowShareModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>📤</span>
                  Share Your Pet
                </motion.button>
                {baseUsername && (
                  <motion.button
                    onClick={() => {
                      const shareText = generateSocialShareText(petName, baseUsername, mintedTokenId || '')
                      const shareUrl = generateShareableLink(baseUsername, mintedTokenId || '')
                      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
                      window.open(twitterUrl, '_blank')
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>🐦</span>
                    Share on X
                  </motion.button>
                )}
                <motion.button
                  onClick={() => window.location.href = `/care/${mintedTokenId}`}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>❤️</span>
                  Care for Pet
                </motion.button>
                <motion.button
                  onClick={() => window.location.href = '/discover'}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>👥</span>
                  Find Tribes
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {mounted && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          petName={petName}
          basename={generateBasename(petName, mintedTokenId || '1')}
          tokenId={mintedTokenId || '1'}
          baseUsername={baseUsername || undefined}
        />
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ec4899, #3b82f6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ec4899, #3b82f6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}

export default function AdoptPage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PetPals...</p>
        </div>
      </div>
    }>
      <AdoptPageContent />
    </ClientOnly>
  )
}