'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [output, setOutput] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const checkPets = () => {
    if (!mounted) return
    
    const stored = localStorage.getItem('petbase-created-pets')
    if (stored) {
      try {
        const pets = JSON.parse(stored)
        setOutput(`<h3>Found ${pets.length} pets:</h3><pre>${JSON.stringify(pets, null, 2)}</pre>`)
      } catch (error: any) {
        setOutput(`<p>Error parsing pets: ${error.message}</p>`)
      }
    } else {
      setOutput('<p>No pets found in localStorage</p>')
    }
  }

  const addTestPet = () => {
    if (!mounted) return
    
    const existingPets = JSON.parse(localStorage.getItem('petbase-created-pets') || '[]')
    const newPet = {
      tokenId: `debug-${Date.now()}`,
      name: `DebugPet-${existingPets.length + 1}`,
      petType: 'puppy',
      health: 100,
      happiness: 100,
      level: 1,
      traits: ['Friendly', 'Test'],
      bio: 'A test pet for debugging.',
      tribeSize: 1,
      maxTribeSize: 10,
      createdAt: Date.now(),
      owner: '0xDebugAddress',
    }
    const updatedPets = [...existingPets, newPet]
    localStorage.setItem('petpals-created-pets', JSON.stringify(updatedPets))
    setOutput(`<p>Added test pet: ${newPet.name}</p>`)
    checkPets()
  }

  const clearPets = () => {
    if (!mounted) return
    
    localStorage.removeItem('petbase-created-pets')
    setOutput('<p>All pets cleared from localStorage</p>')
    checkPets()
  }

  useEffect(() => {
    if (mounted) {
      checkPets()
    }
  }, [mounted])

  if (!mounted) {
    return <div>Loading Debug Tool...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">PetBase Debug Tool</h1>
      <div className="space-x-4 mb-6">
        <button 
          onClick={checkPets} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Check Pets in localStorage
        </button>
        <button 
          onClick={addTestPet} 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Add Test Pet
        </button>
        <button 
          onClick={clearPets} 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Clear All Pets
        </button>
      </div>
      <div 
        id="output" 
        className="bg-gray-100 p-4 rounded-lg" 
        dangerouslySetInnerHTML={{ __html: output }}
      ></div>
    </div>
  )
}
