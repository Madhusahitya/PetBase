'use client'

import { useCallback, useEffect, useState } from 'react'
import { useClientAccount } from './useClientAccount'

interface PetItem {
  tokenId: string
  name: string
  health: number
  happiness: number
  level: number
  traits: string[]
}

export function usePetNFT() {
  const { address, isConnected } = useClientAccount()
  const [pets, setPets] = useState<PetItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const mintPet = useCallback(async () => {
    // Demo mode - simulate minting
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add a mock pet
      const newPet: PetItem = {
        tokenId: `demo-${Date.now()}`,
        name: 'Fluffy',
        health: 100,
        happiness: 80,
        level: 1,
        traits: ['Friendly', 'Energetic'],
      }
      
      setPets(prev => [...prev, newPet])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshPets = useCallback(async () => {
    // Demo mode - return mock pets
    const mockPets: PetItem[] = [
      {
        tokenId: '1',
        name: 'Buddy',
        health: 85,
        happiness: 92,
        level: 3,
        traits: ['Friendly', 'Energetic', 'Loyal'],
      },
      {
        tokenId: '2',
        name: 'Whiskers',
        health: 78,
        happiness: 88,
        level: 2,
        traits: ['Curious', 'Independent'],
      },
    ]
    setPets(mockPets)
  }, [])

  useEffect(() => {
    if (isConnected) {
      refreshPets()
    } else {
      setPets([])
    }
  }, [isConnected, refreshPets])

  return { pets, mintPet, refreshPets, isLoading }
}


