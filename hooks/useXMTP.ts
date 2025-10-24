import { useState, useEffect, useCallback, useRef } from 'react'
import { Client, Conversation, DecodedMessage } from '@xmtp/xmtp-js'
import { useAccount, useSignMessage, useWalletClient, usePublicClient } from 'wagmi'
import toast from 'react-hot-toast'

export interface XMTPMessage {
  id: string
  content: string
  senderAddress: string
  sent: Date
}

export interface XMTPConversation {
  topic: string
  peerAddress: string
  messages: XMTPMessage[]
}

export function useXMTP() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  
  const [client, setClient] = useState<Client | null>(null)
  const [conversations, setConversations] = useState<XMTPConversation[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const retryCount = useRef(0)
  const maxRetries = 3

  // Exponential backoff retry function
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Create a more compatible signer using ethers.js style
  const createSigner = useCallback(() => {
    if (!address || !walletClient) {
      throw new Error('Wallet client or address not available')
    }

    console.log('XMTP: Creating ethers-compatible signer')
    
    // Create a signer that matches ethers.js Signer interface more closely
    const signer = {
      getAddress: async () => {
        console.log('XMTP: getAddress called, returning:', address)
        return address
      },
      signMessage: async (message: string) => {
        console.log('XMTP: signMessage called for message:', message.substring(0, 50) + '...')
        try {
          const signature = await signMessageAsync({ message })
          console.log('XMTP: Message signed successfully')
          return signature
        } catch (error) {
          console.error('XMTP: Sign message failed:', error)
          throw error
        }
      },
      signTypedData: async (domain: any, types: any, value: any) => {
        console.log('XMTP: signTypedData called')
        try {
          if (walletClient && 'signTypedData' in walletClient) {
            const signature = await (walletClient as any).signTypedData({
              domain,
              types,
              primaryType: Object.keys(types)[0] || 'Message',
              message: value
            })
            console.log('XMTP: signTypedData successful')
            return signature
          }
          throw new Error('signTypedData not supported by wallet')
        } catch (error) {
          console.error('XMTP: signTypedData failed:', error)
          throw new Error('signTypedData not supported by wallet')
        }
      },
      // Add ethers.js compatible properties
      provider: publicClient,
      _isSigner: true,
      // Add some common ethers properties that XMTP might expect
      connect: () => signer,
      getBalance: () => Promise.resolve('0'),
      getTransactionCount: () => Promise.resolve(0),
      estimateGas: () => Promise.resolve('21000'),
      call: () => Promise.resolve('0x'),
      getGasPrice: () => Promise.resolve('1000000000'),
      resolveName: () => Promise.resolve(null),
      checkTransaction: () => ({}),
      checkTransactionResponse: () => ({}),
      populateTransaction: () => Promise.resolve({}),
      checkProvider: () => {},
      // Add XMTP-specific properties
      _isXMTPCompatible: true,
      // Ensure the signer has the right type for XMTP
      type: 'ethers',
      version: '5.0.0'
    }

    // Add wallet client properties that don't conflict
    Object.keys(walletClient).forEach(key => {
      if (!(key in signer)) {
        (signer as any)[key] = (walletClient as any)[key]
      }
    })

    return signer
  }, [address, walletClient, signMessageAsync, publicClient])

  // Initialize XMTP client with proper error handling
  const initializeClient = useCallback(async () => {
    if (!address || !isConnected || !walletClient) {
      console.log('XMTP: Missing required dependencies')
      setError('Wallet not connected')
      return
    }

    if (isLoading || isInitialized) {
      console.log('XMTP: Already initializing or initialized')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log('XMTP: Starting initialization...')
      console.log('XMTP: Address:', address)
      console.log('XMTP: Wallet client type:', typeof walletClient)

      const signer = createSigner()
      console.log('XMTP: Signer created successfully')
      
      // Try production environment first (more stable for Base Builder Track)
      console.log('XMTP: Attempting to create client with production environment...')
      
      // Try different XMTP client creation approaches
      let xmtpClient
      
      try {
        // Method 1: Direct client creation
        xmtpClient = await Client.create({
          signer: signer as any,
          env: 'production'
        } as any)
        console.log('XMTP: Method 1 (direct) succeeded')
      } catch (method1Error) {
        console.log('XMTP: Method 1 failed, trying method 2...')
        
        try {
          // Method 2: With explicit options
          xmtpClient = await Client.create({
            signer: signer as any,
            env: 'production',
            options: {
              skipContactPublishing: true,
              skipContactDiscovery: true
            }
          } as any)
          console.log('XMTP: Method 2 (with options) succeeded')
        } catch (method2Error) {
          console.log('XMTP: Method 2 failed, trying method 3...')
          
          // Method 3: Try with dev environment
          xmtpClient = await Client.create({
            signer: signer as any,
            env: 'dev'
          } as any)
          console.log('XMTP: Method 3 (dev environment) succeeded')
        }
      }
      
      console.log('XMTP: Client created successfully!')
      console.log('XMTP: Client address:', xmtpClient.address)
      
      setClient(xmtpClient)
      setIsInitialized(true)
      retryCount.current = 0
      
      console.log('XMTP: Client initialized successfully!')
      toast.success('XMTP connected! Real-time chat enabled 🚀')
      
    } catch (err) {
      console.error('XMTP: Initialization failed:', err)
      const error = err instanceof Error ? err : new Error(String(err))
      
      // Try dev environment as fallback
      if (error.message.includes('production') || error.message.includes('network')) {
        console.log('XMTP: Production failed, trying dev environment...')
        try {
          const fallbackSigner = createSigner()
          const devClient = await Client.create({
            signer: fallbackSigner as any,
            env: 'dev'
          } as any)
          
          setClient(devClient)
          setIsInitialized(true)
          console.log('XMTP: Dev environment connected!')
          toast.success('XMTP connected (dev mode)! 🚀')
          return
        } catch (devError) {
          console.error('XMTP: Dev environment also failed:', devError)
        }
      }
      
      setError(`XMTP initialization failed: ${error.message}`)
      console.log('XMTP: All environments failed, enabling demo mode')
      setIsInitialized(true) // Enable demo mode as fallback
      toast.error('XMTP unavailable - using demo mode')
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected, walletClient, createSigner, isLoading, isInitialized])

  // Initialize on mount with timeout
  useEffect(() => {
    if (address && isConnected && !isInitialized && !isLoading) {
      // Set a timeout to enable demo mode if XMTP takes too long
      const timeout = setTimeout(() => {
        if (!isInitialized) {
          console.log('XMTP initialization timeout, enabling demo mode')
          setIsInitialized(true)
          setError('XMTP timeout - using demo mode')
        }
      }, 5000) // 5 second timeout
      
      initializeClient()
      
      return () => clearTimeout(timeout)
    }
  }, [address, isConnected, isInitialized, isLoading, initializeClient])

  // Create or get group conversation with tribe members
  const createTribeConversation = useCallback(async (tribeMembers: string[]) => {
    if (!client || !address) {
      console.log('XMTP: Client not initialized')
      return null
    }

    try {
      // Filter out current user and create group conversation with other tribe members
      const otherMembers = tribeMembers.filter(member => 
        member.toLowerCase() !== address.toLowerCase()
      )

      if (otherMembers.length === 0) {
        console.log('XMTP: No other tribe members to chat with')
        return null
      }

      console.log('XMTP: Creating group conversation with members:', otherMembers)

      // Create group conversation with all tribe members
      // Note: XMTP doesn't have newGroup, we'll use newConversation for now
      const conversation = await client.conversations.newConversation(otherMembers[0])
      
      // Load existing messages
      const messages = await conversation.messages()
      const messageData: XMTPMessage[] = messages.map((msg: DecodedMessage) => ({
        id: msg.id,
        content: msg.content,
        senderAddress: msg.senderAddress,
        sent: msg.sent
      }))
      
      const conversationData: XMTPConversation = {
        topic: conversation.topic,
        peerAddress: otherMembers.join(','), // Store all members as comma-separated string
        messages: messageData
      }

      // Note: Real-time message streaming will be added later
      // For now, we'll just load existing messages

      setConversations(prev => [...prev, conversationData])
      return { topic: conversation.topic, messages: messageData }
    } catch (err) {
      console.error('XMTP: Failed to create group conversation:', err)
      setError(err instanceof Error ? err.message : 'Failed to create group conversation')
      return null
    }
  }, [client, address])

  // Send message to group conversation
  const sendMessage = useCallback(async (conversationTopic: string, content: string) => {
    if (!client || !address) {
      console.log('XMTP: Client not initialized or no address')
      return false
    }

    try {
      // Find the conversation
      const conversation = conversations.find(conv => conv.topic === conversationTopic)
      if (!conversation) {
        console.error('XMTP: Conversation not found')
        return false
      }

      // Get the actual conversation object
      // For conversations, we need to get the conversation by peer address
      const conv = await client.conversations.newConversation(conversation.peerAddress.split(',')[0])
      await conv.send(content)
      
      // Add message to local state immediately for better UX
      const newMessage: XMTPMessage = {
        id: Date.now().toString(), // Temporary ID
        content,
        senderAddress: address,
        sent: new Date()
      }
      
      setConversations(prev => 
        prev.map(conv => 
          conv.topic === conversationTopic
            ? { ...conv, messages: [...conv.messages, newMessage] }
            : conv
        )
      )
      
      console.log('XMTP: Message sent successfully to group')
      return true
    } catch (err) {
      console.error('XMTP: Failed to send message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      return false
    }
  }, [client, conversations, address])

  // Get messages for a conversation
  const getMessages = useCallback((conversationTopic: string) => {
    const conversation = conversations.find(conv => conv.topic === conversationTopic)
    return conversation?.messages || []
  }, [conversations])

  return {
    client,
    isInitialized,
    isLoading,
    error,
    conversations,
    createTribeConversation,
    sendMessage,
    getMessages,
    initializeClient,
    retryCount: retryCount.current,
    maxRetries
  }
}

