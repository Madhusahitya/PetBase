'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useClientAccount } from '@/hooks/useClientAccount'

export default function RetroNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isConnected } = useClientAccount()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { path: '/', label: 'HOME' },
    { path: '/discover', label: 'DISCOVER' },
    { path: '/adopt', label: 'ADOPT' },
    { path: '/alliances', label: 'ALLIANCES' },
    { path: '/rewards', label: 'REWARDS' },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <nav className="retro-navbar">
      <div className="retro-nav-container">
        {/* Logo */}
        <motion.div
          className="retro-logo"
          whileHover={{ scale: 1.05 }}
          onClick={() => router.push('/')}
        >
          <div className="arc-text-container">
            {['P', 'e', 't', 'B', 'a', 's', 'e'].map((char, index) => (
              <span
                key={index}
                className="arc-char"
                style={{
                  transform: `rotate(${(-15 + index * 5)}deg)`,
                  transformOrigin: 'bottom center',
                  position: 'absolute',
                  left: `${index * 20 - 60}px`,
                  bottom: '0px',
                  height: '40px'
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex retro-nav-items">
          {navItems.map((item) => (
            <motion.button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`retro-nav-item ${isActive(item.path) ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="retro-text">{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Wallet Info and Connect Button */}
        <div className="retro-connect flex items-center gap-6">
          {mounted && isConnected && (
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white border-2 border-black rounded-lg px-4 py-3 flex items-center gap-3 min-w-[120px]" style={{ boxShadow: '2px 2px 0px #000' }}>
                <span className="retro-text text-sm text-black font-bold">PET:</span>
                <span className="retro-text text-sm text-black font-bold">0</span>
                <div className="w-5 h-5 bg-yellow-400 rounded border border-black flex items-center justify-center">
                  <span className="text-black font-bold text-xs">P</span>
                </div>
              </div>
            </div>
          )}
          <div className="min-w-[200px]">
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden retro-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className={`retro-mobile-menu ${isMenuOpen ? 'open' : ''}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMenuOpen ? 1 : 0,
          height: isMenuOpen ? 'auto' : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="retro-mobile-nav-items">
          {navItems.map((item) => (
            <motion.button
              key={item.path}
              onClick={() => {
                router.push(item.path)
                setIsMenuOpen(false)
              }}
              className={`retro-mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="retro-text">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        .retro-navbar {
          background: #ff4444;
          border-bottom: 4px solid #000;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 4px 0px #000;
        }

        .retro-nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          gap: 20px;
        }

        .retro-logo {
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 5px;
          padding-right: 20px;
        }

        .arc-text-container {
          position: relative;
          width: 200px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .arc-char {
          font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
          font-weight: 800;
          font-size: 24px;
          letter-spacing: 1px;
          color: #ffdd00;
          text-shadow: 
            -2px -2px 0px #ff0000,
            2px -2px 0px #ff8000,
            -2px 2px 0px #ffff00,
            2px 2px 0px #80ff00,
            -1px -1px 0px #00ff00,
            1px -1px 0px #00ff80,
            -1px 1px 0px #00ffff,
            1px 1px 0px #0080ff,
            0px -2px 0px #0000ff,
            0px 2px 0px #8000ff,
            -2px 0px 0px #ff00ff,
            2px 0px 0px #ff0080,
            0 0 10px rgba(255, 0, 0, 0.3),
            0 0 20px rgba(255, 128, 0, 0.2),
            0 0 30px rgba(0, 255, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
          display: inline-block;
        }

        .arc-char:hover {
          transform: scale(1.1);
          filter: brightness(1.2);
        }

        .retro-nav-items {
          display: flex;
          gap: 15px;
          align-items: center;
          flex: 1;
          justify-content: center;
        }

        .retro-nav-item {
          background: #ffffff;
          border: 3px solid #000;
          border-radius: 8px;
          padding: 10px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 3px 3px 0px #000;
          min-width: 90px;
          font-family: 'Press Start 2P', 'Courier New', monospace;
          font-weight: normal;
          font-size: 10px;
          letter-spacing: 0.3px;
        }

        .retro-nav-item:hover {
          transform: translateY(-2px);
          box-shadow: 5px 5px 0px #000;
        }

        .retro-nav-item.active {
          background: #ffdd00;
          transform: translateY(-2px);
          box-shadow: 5px 5px 0px #000;
        }

        .retro-connect {
          display: flex;
          align-items: center;
          gap: 20px;
          min-width: 300px;
          justify-content: flex-end;
          padding-left: 20px;
        }

        .retro-menu-btn {
          background: #ffffff;
          border: 3px solid #000;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          box-shadow: 3px 3px 0px #000;
        }

        .hamburger {
          width: 24px;
          height: 18px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hamburger span {
          width: 100%;
          height: 3px;
          background: #000;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        .retro-mobile-menu {
          background: #ff4444;
          border-top: 3px solid #000;
          overflow: hidden;
        }

        .retro-mobile-nav-items {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .retro-mobile-nav-item {
          background: #ffffff;
          border: 3px solid #000;
          border-radius: 8px;
          padding: 15px 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 3px 3px 0px #000;
          font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.3px;
        }

        .retro-mobile-nav-item:hover {
          transform: translateY(-2px);
          box-shadow: 5px 5px 0px #000;
        }

        .retro-mobile-nav-item.active {
          background: #ffdd00;
          transform: translateY(-2px);
          box-shadow: 5px 5px 0px #000;
        }

        .retro-text {
          font-family: 'Press Start 2P', 'Courier New', monospace;
          text-shadow: 1px 1px 0px #000;
          letter-spacing: 0.5px;
          font-weight: normal;
          font-size: 10px;
        }

        /* RainbowKit ConnectButton Custom Styling */
        .retro-connect [data-rk] {
          min-width: 200px !important;
          width: 100% !important;
        }

        .retro-connect [data-rk] button {
          min-width: 200px !important;
          width: 100% !important;
          padding: 12px 20px !important;
          border-radius: 8px !important;
          border: 2px solid #000 !important;
          box-shadow: 3px 3px 0px #000 !important;
          background: #ffffff !important;
          color: #000 !important;
          font-weight: normal !important;
          font-size: 9px !important;
          letter-spacing: 0.3px !important;
          transition: all 0.2s ease !important;
        }

        .retro-connect [data-rk] button:hover {
          transform: translateY(-2px) !important;
          box-shadow: 5px 5px 0px #000 !important;
        }
      `}</style>
    </nav>
  )
}
