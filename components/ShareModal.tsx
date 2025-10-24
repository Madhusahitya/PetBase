'use client'

import { useState } from 'react'
import { generateShareUrls } from '@/utils/basename'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  petName: string
  basename: string
  tokenId: string
  baseUsername?: string
}

export default function ShareModal({ isOpen, onClose, petName, basename, tokenId, baseUsername }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  
  if (!isOpen) return null

  const shareUrls = generateShareUrls(petName, basename, tokenId)

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareUrls.webShare)
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to copy
      navigator.clipboard.writeText(`${shareUrls.webShare.text} ${shareUrls.webShare.url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareUrls.webShare.text} ${shareUrls.webShare.url}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Share Your Pet!</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="text-lg font-semibold mb-2">{petName}</div>
          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded mb-2">
            Basename: {basename}
          </div>
          {baseUsername && (
            <div className="text-sm text-blue-600 bg-blue-100 p-2 rounded">
              <span className="font-bold">Base Username:</span> {baseUsername}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleWebShare}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share via Web
          </button>

          <a
            href={shareUrls.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share on X
          </a>

          <button
            onClick={handleCopy}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  )
}
