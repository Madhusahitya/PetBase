'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { useEffect } from 'react'

interface PetCardData {
  tokenId: number
  name: string
  type: string
  tribeSize: number
  bio?: string
  image?: string
}

export default function PetSwipeCard({ data, onSwipeLeft, onSwipeRight }: {
  data: PetCardData
  onSwipeLeft: () => void
  onSwipeRight: () => void
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const opacity = useTransform(x, [-200, 0, 200], [0.3, 1, 0.3])

  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft(),
    onSwipedRight: () => onSwipeRight(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  })

  useEffect(() => {
    const unsub = x.on('change', (latest) => {
      if (latest > 180) onSwipeRight()
      if (latest < -180) onSwipeLeft()
    })
    return () => unsub()
  }, [x, onSwipeLeft, onSwipeRight])

  return (
    <div {...handlers} className="w-full max-w-md mx-auto">
      <div className="relative">
        <motion.div
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          className="bg-white rounded-2xl shadow-lg p-6 select-none"
        >
          <img
            src={data.image || 'https://picsum.photos/seed/pet/400/300'}
            alt={data.name}
            className="w-full h-64 object-cover rounded-xl mb-4"
          />
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold">{data.name}</h3>
            <span className="text-sm text-gray-600">{data.type}</span>
          </div>
          <div className="text-gray-700 mb-2">Tribe: {data.tribeSize}/10 members</div>
          <p className="text-gray-500">{data.bio || 'Fun pet squad!'}</p>

          {/* Overlays */}
          <div className="pointer-events-none absolute inset-0 flex items-start justify-between p-4">
            <div className="text-green-500 font-extrabold text-3xl opacity-0 sm:opacity-100">LIKE</div>
            <div className="text-red-500 font-extrabold text-3xl opacity-0 sm:opacity-100">NOPE</div>
          </div>
        </motion.div>
        <div className="flex gap-4 mt-4">
          <button onClick={onSwipeLeft} className="flex-1 bg-red-100 text-red-600 font-semibold py-2 rounded-lg">Skip</button>
          <button onClick={onSwipeRight} className="flex-1 bg-green-100 text-green-700 font-semibold py-2 rounded-lg">Join</button>
        </div>
      </div>
    </div>
  )
}


