import React from 'react'
import { XMTPMessage } from '@/hooks/useXMTP'

interface ChatMessageProps {
  message: XMTPMessage
  isOwn: boolean
}

export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} p-2 mb-2`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        <div className="text-sm font-medium mb-1">
          {isOwn ? 'You' : formatAddress(message.senderAddress)}
        </div>
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <div className={`text-xs mt-1 ${
          isOwn ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {formatTime(message.sent)}
        </div>
      </div>
    </div>
  )
}
