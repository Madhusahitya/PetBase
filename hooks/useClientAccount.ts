'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect, useState } from 'react'

export function useClientAccount() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const { connect, connectors, error: connectError, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return {
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
      connect: () => {},
      disconnect: () => {},
      connectors: [],
      error: null,
      isPending: false,
    }
  }

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isPending,
    isDisconnected,
    connect,
    disconnect,
    connectors,
    error: connectError,
    isPending,
  }
}


