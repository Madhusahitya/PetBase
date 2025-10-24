'use client'

import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useClientAccount } from '@/hooks/useClientAccount'

export default function Navbar() {
  const { isConnected } = useClientAccount()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-pet-blue">
              PetBase
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-pet-blue transition-colors">
                Home
              </Link>
              <Link href="/adopt" className="text-gray-700 hover:text-pet-blue transition-colors">
                Adopt
              </Link>
              <Link href="/discover" className="text-gray-700 hover:text-pet-blue transition-colors">
                Discover
              </Link>
              <Link href="/myalliances" className="text-gray-700 hover:text-pet-blue transition-colors">
                My Alliances
              </Link>
              <Link href="/rewards" className="text-gray-700 hover:text-pet-blue transition-colors">
                Rewards
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {mounted && isConnected && (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-gray-600">PET Tokens: 0</span>
                <div className="w-8 h-8 bg-pet-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
              </div>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
