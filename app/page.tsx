'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import ClientOnly from '@/components/ClientOnly'
import { useClientAccount } from '@/hooks/useClientAccount'
import RetroHomePage from '@/components/RetroHomePage'
import RetroNavbar from '@/components/RetroNavbar'

function HomePageContent() {
  const { address, isConnected } = useClientAccount()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="retro-game-ui flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="retro-text text-black">Loading PetBase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="retro-game-ui min-h-screen">
      <RetroNavbar />
      <RetroHomePage />
    </div>
  )
}

export default function HomePage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading PetBase...</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </ClientOnly>
  )
}