'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useXMTP, XMTPMessage } from '@/hooks/useXMTP'
import { useAccount } from 'wagmi'

interface TribeChatProps {
  tribeMembers: string[]
  petName: string
  petTokenId: string
  isOpen: boolean
  onClose: () => void
}

export default function TribeChat({ 
  tribeMembers, 
  petName, 
  petTokenId, 
  isOpen, 
  onClose 
}: TribeChatProps) {
  const { address } = useAccount()
  const { 
    isInitialized, 
    isLoading, 
    error, 
    conversations, 
    createTribeConversation, 
    sendMessage, 
    getMessages 
  } = useXMTP()
  
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversations])

  // Initialize conversation when component opens
  useEffect(() => {
    if (isOpen && isInitialized && tribeMembers.length > 0 && !currentConversation) {
      createTribeConversation(tribeMembers)
        .then(conv => {
          if (conv) {
            setCurrentConversation(conv.topic)
          }
        })
    }
  }, [isOpen, isInitialized, tribeMembers, currentConversation, createTribeConversation])

  // Get current conversation messages
  const currentMessages = currentConversation ? getMessages(currentConversation) : []

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !currentConversation || isSending) return

    setIsSending(true)
    try {
      const success = await sendMessage(currentConversation, message.trim())
      if (success) {
        setMessage('')
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsSending(false)
    }
  }

  // Format message time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Check if message is from current user
  const isOwnMessage = (senderAddress: string) => {
    return senderAddress.toLowerCase() === address?.toLowerCase()
  }

  if (!isOpen) return null

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
              <h3 className="text-lg font-semibold text-gray-800">
                {petName}'s Tribe Chat
              </h3>
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
                      <p className="text-gray-600">Initializing XMTP...</p>
                    </>
                  ) : error ? (
                    <>
                      <div className="text-red-500 text-4xl mb-4">⚠️</div>
                      <p className="text-red-600 mb-2">Failed to initialize chat</p>
                      <p className="text-sm text-gray-500">{error}</p>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400 text-4xl mb-4">💬</div>
                      <p className="text-gray-600">Connecting to chat...</p>
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
                        className={`flex ${isOwnMessage(msg.senderAddress) ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            isOwnMessage(msg.senderAddress)
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage(msg.senderAddress) ? 'text-pink-100' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.sent)}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || isSending}
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
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

