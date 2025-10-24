'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useClientAccount } from '@/hooks/useClientAccount'
import { useContractRead } from 'wagmi'
import { PET_NFT_ADDRESS, PET_NFT_ABI_FINAL as PET_NFT_ABI } from '@/utils/contracts'
import { generateBaseUsername } from '@/utils/baseUsername'
import RetroPixelPet from './RetroPixelPet'

interface PetForSale {
  tokenId: string
  name: string
  level: number
  health: number
  happiness: number
  petType: string
  baseUsername: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  estimatedValue: number
}

interface OpenSeaMarketplaceProps {
  className?: string
}

export default function OpenSeaMarketplace({ className = '' }: OpenSeaMarketplaceProps) {
  const { address, isConnected } = useClientAccount()
  const [userPets, setUserPets] = useState<PetForSale[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPet, setSelectedPet] = useState<PetForSale | null>(null)
  const [showSellModal, setShowSellModal] = useState(false)

  // Get user's pet tokens (simplified - in real implementation, you'd fetch from contract)
  const { data: userTokens, isLoading: tokensLoading } = useContractRead({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    functionName: 'tokensOfOwner',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  useEffect(() => {
    if (userTokens && Array.isArray(userTokens)) {
      // Convert token IDs to pet data (simplified)
      const pets: PetForSale[] = userTokens.map((tokenId: any, index: number) => {
        const level = Math.floor(Math.random() * 15) + 1 // Simulated level
        const rarity = level >= 12 ? 'Legendary' : level >= 8 ? 'Epic' : level >= 5 ? 'Rare' : 'Common'
        const estimatedValue = rarity === 'Legendary' ? 0.1 : rarity === 'Epic' ? 0.05 : rarity === 'Rare' ? 0.02 : 0.005
        
        return {
          tokenId: tokenId.toString(),
          name: `Pet ${tokenId}`,
          level,
          health: Math.floor(Math.random() * 40) + 60,
          happiness: Math.floor(Math.random() * 40) + 60,
          petType: ['puppy', 'kitten', 'dragon'][index % 3],
          baseUsername: generateBaseUsername(`Pet${tokenId}`, ['puppy', 'kitten', 'dragon'][index % 3], tokenId.toString()),
          rarity,
          estimatedValue
        }
      })
      setUserPets(pets)
    }
  }, [userTokens])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-600 bg-yellow-100'
      case 'Epic': return 'text-purple-600 bg-purple-100'
      case 'Rare': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRarityEmoji = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return '👑'
      case 'Epic': return '💎'
      case 'Rare': return '⭐'
      default: return '🐾'
    }
  }

  const handleSellPet = (pet: PetForSale) => {
    setSelectedPet(pet)
    setShowSellModal(true)
  }

  const openOpenSea = (pet: PetForSale) => {
    const openseaUrl = `https://opensea.io/assets/base/${PET_NFT_ADDRESS}/${pet.tokenId}`
    window.open(openseaUrl, '_blank')
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔗</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Connect Wallet</h3>
        <p className="text-gray-600">Connect your wallet to view your pets for sale</p>
      </div>
    )
  }

  if (tokensLoading || loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your pets...</p>
      </div>
    )
  }

  if (userPets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🐾</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Pets Yet</h3>
        <p className="text-gray-600 mb-4">Create your first pet to start trading!</p>
        <motion.button
          onClick={() => window.location.href = '/adopt'}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Create Pet
        </motion.button>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          🏪 OpenSea Marketplace
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Sell your leveled-up pets on OpenSea with their unique Base usernames!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userPets.map((pet, index) => (
          <motion.div
            key={pet.tokenId}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Pet Image */}
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto mb-3">
                <RetroPixelPet
                  petType={pet.petType as any}
                  level={pet.level}
                  health={pet.health}
                  happiness={pet.happiness}
                  className="w-full h-full"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{pet.name}</h3>
              <p className="text-sm text-blue-600 font-mono">{pet.baseUsername}</p>
            </div>

            {/* Pet Stats */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Level</span>
                <span className="text-sm font-bold text-gray-800">{pet.level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Health</span>
                <span className="text-sm font-bold text-gray-800">{pet.health}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Happiness</span>
                <span className="text-sm font-bold text-gray-800">{pet.happiness}%</span>
              </div>
            </div>

            {/* Rarity Badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getRarityColor(pet.rarity)}`}>
                {getRarityEmoji(pet.rarity)} {pet.rarity}
              </span>
            </div>

            {/* Estimated Value */}
            <div className="mb-4">
              <div className="text-center">
                <span className="text-sm text-gray-600">Estimated Value</span>
                <div className="text-lg font-bold text-green-600">{pet.estimatedValue} ETH</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <motion.button
                onClick={() => handleSellPet(pet)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                📈 List on OpenSea
              </motion.button>
              <motion.button
                onClick={() => openOpenSea(pet)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔍 View on OpenSea
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sell Modal */}
      {showSellModal && selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">List Pet on OpenSea</h3>
              <button
                onClick={() => setShowSellModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3">
                <RetroPixelPet
                  petType={selectedPet.petType as any}
                  level={selectedPet.level}
                  health={selectedPet.health}
                  happiness={selectedPet.happiness}
                  className="w-full h-full"
                />
              </div>
              <h4 className="text-lg font-bold">{selectedPet.name}</h4>
              <p className="text-sm text-blue-600 font-mono">{selectedPet.baseUsername}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getRarityColor(selectedPet.rarity)}`}>
                  {getRarityEmoji(selectedPet.rarity)} {selectedPet.rarity}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  defaultValue={selectedPet.estimatedValue}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.01"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Base Username:</strong> {selectedPet.baseUsername}<br/>
                  <strong>Rarity:</strong> {selectedPet.rarity}<br/>
                  <strong>Level:</strong> {selectedPet.level}
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => {
                    const openseaUrl = `https://opensea.io/assets/base/${PET_NFT_ADDRESS}/${selectedPet.tokenId}`
                    window.open(openseaUrl, '_blank')
                    setShowSellModal(false)
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Open OpenSea
                </motion.button>
                <motion.button
                  onClick={() => setShowSellModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
