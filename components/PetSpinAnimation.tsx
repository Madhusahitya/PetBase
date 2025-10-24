'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PetSpinAnimationProps {
  children: ReactNode
  trigger: boolean
  className?: string
}

export default function PetSpinAnimation({ children, trigger, className = '' }: PetSpinAnimationProps) {
  return (
    <motion.div
      className={className}
      animate={trigger ? {
        rotate: [0, 360, 0],
        scale: [1, 1.2, 1],
      } : {}}
      transition={{
        duration: 1,
        ease: "easeInOut",
        times: [0, 0.5, 1]
      }}
    >
      {children}
    </motion.div>
  )
}
