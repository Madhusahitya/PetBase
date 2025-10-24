'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker from 'emoji-picker-react'
import { useClientAccount } from '@/hooks/useClientAccount'
import { useXMTP, XMTPMessage } from '@/hooks/useXMTP'
import { useContractRead, useWatchContractEvent } from 'wagmi'
import { PET_NFT_ADDRESS, PET_NFT_ABI_FINAL as PET_NFT_ABI } from '@/utils/contracts'
import { useAccount } from 'wagmi'
import toast from 'react-hot-toast'
import ChatMessage from './ChatMessage'

interface XMTPTribeChatProps {
  tokenId: string
  tribeMembers: string[]
  isVisible: boolean
  onClose: () => void
}

export default function XMTPTribeChat({ tokenId, tribeMembers: initialTribeMembers, isVisible, onClose }: XMTPTribeChatProps) {
  const { address, isConnected } = useClientAccount()
  const { address: wagmiAddress } = useAccount()
  const {
    isInitialized: isXMTPInitialized,
    isLoading,
    error,
    conversations,
    createTribeConversation,
    sendMessage,
    getMessages
  } = useXMTP()
  
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [demoMessages, setDemoMessages] = useState<XMTPMessage[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [tribeMembers, setTribeMembers] = useState<string[]>(initialTribeMembers)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch tribe members from contract
  const { data: fetchedTribeMembers, refetch: refetchTribeMembers } = useContractRead({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    functionName: 'tribeMembers',
    args: [BigInt(tokenId), BigInt(0)], // Get first member as a test
    query: {
      enabled: !!tokenId,
    },
  })

  // Listen for TribeJoined events to refresh tribe members
  useWatchContractEvent({
    address: PET_NFT_ADDRESS,
    abi: PET_NFT_ABI,
    eventName: 'TribeJoined',
    onLogs: (logs) => {
      console.log('TribeJoined event detected in chat:', logs)
      // Check if this event is for our pet
      const relevantLogs = logs.filter(log => 
        log.args.tokenId && BigInt(log.args.tokenId).toString() === tokenId
      )
      
      if (relevantLogs.length > 0) {
        console.log('Tribe member joined for our pet, refreshing...')
        refetchTribeMembers()
        toast.success('New tribe member joined! 🎉')
      }
    },
  })

  // Update tribe members when fetched data changes
  useEffect(() => {
    if (fetchedTribeMembers && Array.isArray(fetchedTribeMembers)) {
      setTribeMembers(fetchedTribeMembers)
    }
  }, [fetchedTribeMembers])

  // Initialize conversation when component becomes visible
  useEffect(() => {
    console.log('Conversation init effect:', { 
      isVisible, 
      isXMTPInitialized, 
      tribeMembersLength: tribeMembers.length, 
      currentConversation,
      error
    })
    
    if (isVisible && !currentConversation) {
      // Try XMTP first for Base Builder Track submission
      if (isXMTPInitialized && tribeMembers.length > 0) {
        console.log('XMTP is initialized, creating real conversation...')
        createTribeConversation(tribeMembers)
          .then(conv => {
            if (conv) {
              console.log('XMTP conversation created successfully')
              setCurrentConversation(conv.topic)
              setIsInitialized(true)
              toast.success('Connected to real-time chat! 🚀')
            } else {
              throw new Error('Failed to create XMTP conversation')
            }
          })
          .catch(err => {
            console.error('XMTP conversation failed, falling back to demo mode:', err)
            // Fallback to demo mode
            const sampleMessages: XMTPMessage[] = [
              {
                id: '1',
                content: `Welcome to Pet #${tokenId}'s tribe chat! 🎉`,
                senderAddress: tribeMembers[0] || '0x1234...5678',
                sent: new Date(Date.now() - 300000) // 5 minutes ago
              },
              {
                id: '2',
                content: 'Thanks! Excited to be part of this tribe!',
                senderAddress: address || '0x0000...0000',
                sent: new Date(Date.now() - 120000) // 2 minutes ago
              },
              {
                id: '3',
                content: 'Let\'s take good care of our pet together! 💪',
                senderAddress: tribeMembers[0] || '0x1234...5678',
                sent: new Date(Date.now() - 60000) // 1 minute ago
              }
            ]
            setDemoMessages(sampleMessages)
            setCurrentConversation('demo-conversation')
            setIsInitialized(true)
            toast.error('XMTP failed - using demo mode')
          })
      } else if (error || !isXMTPInitialized) {
        console.log('XMTP not available, enabling demo mode')
        const sampleMessages: XMTPMessage[] = [
          {
            id: '1',
            content: `Welcome to Pet #${tokenId}'s tribe chat! 🎉`,
            senderAddress: tribeMembers[0] || '0x1234...5678',
            sent: new Date(Date.now() - 300000) // 5 minutes ago
          },
          {
            id: '2',
            content: 'Thanks! Excited to be part of this tribe!',
            senderAddress: address || '0x0000...0000',
            sent: new Date(Date.now() - 120000) // 2 minutes ago
          },
          {
            id: '3',
            content: 'Let\'s take good care of our pet together! 💪',
            senderAddress: tribeMembers[0] || '0x1234...5678',
            sent: new Date(Date.now() - 60000) // 1 minute ago
          }
        ]
        setDemoMessages(sampleMessages)
        setCurrentConversation('demo-conversation')
        setIsInitialized(true)
        toast.success('Tribe chat ready! 💬')
      }
    }
  }, [isVisible, isXMTPInitialized, tribeMembers, currentConversation, createTribeConversation, tokenId, address, error])

  // Demo mode is enabled immediately in the conversation init effect above

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversations])

  // Get current conversation messages
  const currentMessages = currentConversation === 'demo-conversation' 
    ? demoMessages 
    : currentConversation ? getMessages(currentConversation) : []

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Send message clicked:', { newMessage: newMessage.trim(), currentConversation, isSending })
    
    if (!newMessage.trim() || !currentConversation || isSending) {
      console.log('Send blocked:', { hasMessage: !!newMessage.trim(), hasConversation: !!currentConversation, isSending })
      return
    }

    setIsSending(true)
    try {
      if (currentConversation === 'demo-conversation') {
        console.log('Sending demo message')
        // Demo mode - add message to demo messages
        const newMsg: XMTPMessage = {
          id: Date.now().toString(),
          content: newMessage.trim(),
          senderAddress: address || '0x0000...0000',
          sent: new Date()
        }
        setDemoMessages(prev => [...prev, newMsg])
        setNewMessage('')
        setShowEmojiPicker(false)
        toast.success('Message sent! (Demo Mode)')
        console.log('Demo message sent successfully')
      } else {
        console.log('Sending XMTP message to conversation:', currentConversation)
        const success = await sendMessage(currentConversation, newMessage.trim())
        console.log('XMTP send result:', success)
        if (success) {
          setNewMessage('')
          setShowEmojiPicker(false)
          toast.success('Message sent!')
        } else {
          toast.error('Failed to send message')
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  // Handle emoji selection
  const handleEmojiClick = (emoji: any) => {
    setNewMessage(prev => prev + emoji.emoji)
    setShowEmojiPicker(false)
  }

  // Format message time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Check if message is from current user
  const isOwnMessage = (senderAddress: string) => {
    return senderAddress.toLowerCase() === address?.toLowerCase()
  }

  // Get display name for sender
  const getSenderName = (senderAddress: string) => {
    if (isOwnMessage(senderAddress)) return 'You'
    return `${senderAddress.slice(0, 6)}...${senderAddress.slice(-4)}`
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Pet #{tokenId} Tribe Chat
                </h3>
                {currentConversation === 'demo-conversation' ? (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Demo Mode
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Live Chat
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {tribeMembers.length} member{tribeMembers.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col">
            {!isInitialized ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Connecting to XMTP...</p>
                    </>
                  ) : error ? (
                    <>
                      <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
                      <p className="text-yellow-600 mb-2">XMTP not available</p>
                      <p className="text-sm text-gray-500 mb-4">Using demo chat mode</p>
                      <button
                        onClick={() => {
                          // Enable demo mode
                          setIsInitialized(true)
                          setCurrentConversation('demo-conversation')
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Continue with Demo Chat
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400 text-4xl mb-4">💬</div>
                      <p className="text-gray-600">Connecting to chat...</p>
                      <button
                        onClick={() => {
                          // Enable demo mode as fallback
                          setIsInitialized(true)
                          setCurrentConversation('demo-conversation')
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm mt-4"
                      >
                        Use Demo Chat
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">💬</div>
                      <p>Start the conversation!</p>
                      <p className="text-sm">Send a message to your tribe members</p>
                    </div>
                  ) : (
                    currentMessages.map((msg: XMTPMessage) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChatMessage 
                          message={msg} 
                          isOwn={isOwnMessage(msg.senderAddress)} 
                        />
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        disabled={isSending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        😊
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isSending}
                      className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2"
                    >
                      {isSending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-20 left-4 right-4 z-10">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width="100%"
                        height={300}
                        searchDisabled={false}
                        skinTonesDisabled={true}
                      />
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}