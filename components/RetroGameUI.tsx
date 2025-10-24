'use client'

import { motion } from 'framer-motion'

interface RetroGameUIProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export default function RetroGameUI({ children, title, className = '' }: RetroGameUIProps) {
  return (
    <div className={`retro-game-ui ${className}`}>
      {/* Retro game container */}
      <div className="retro-container">
        {title && (
          <div className="retro-title">
            <div className="retro-title-box">
              <h1 className="retro-text text-3xl font-bold text-black">
                {title}
              </h1>
            </div>
            <p className="retro-text text-lg text-black mt-2">
              CHOOSE YOUR COMPANION
            </p>
          </div>
        )}
        {children}
      </div>

      <style jsx>{`
        .retro-game-ui {
          position: relative;
          background: #ff4444; /* Bright red background like reference */
          min-height: 100vh;
          padding: 20px;
          font-family: 'Courier New', monospace;
        }

        .retro-container {
          max-width: 400px;
          margin: 0 auto;
          position: relative;
        }

        .retro-title {
          text-align: center;
          margin-bottom: 40px;
        }

        .retro-title-box {
          background: #ffdd00; /* Bright yellow like reference */
          border: 3px solid #000;
          border-radius: 4px;
          padding: 16px 24px;
          display: inline-block;
          box-shadow: 4px 4px 0px #000;
          margin-bottom: 8px;
        }

        .retro-text {
          font-family: 'Courier New', monospace;
          text-shadow: 2px 2px 0px #000;
          letter-spacing: 1px;
          font-weight: bold;
        }

        /* Retro button styles */
        .retro-button {
          background: #ffdd00;
          border: 3px solid #000;
          border-radius: 4px;
          padding: 12px 24px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #000;
          cursor: pointer;
          transition: all 0.1s ease;
          position: relative;
          box-shadow: 4px 4px 0px #000;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .retro-button:hover {
          transform: translateY(-2px);
          box-shadow: 6px 6px 0px #000;
        }

        .retro-button:active {
          transform: translateY(2px);
          box-shadow: 2px 2px 0px #000;
        }

        /* Pet selection cards */
        .pet-card {
          background: #ffffff;
          border: 3px solid #000;
          border-radius: 8px;
          padding: 20px;
          margin: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          box-shadow: 4px 4px 0px #000;
        }

        .pet-card:hover {
          transform: translateY(-4px);
          box-shadow: 6px 6px 0px #000;
        }

        .pet-card.selected {
          background: #ffdd00;
          transform: translateY(-4px);
          box-shadow: 6px 6px 0px #000;
        }

        /* Input styles */
        .retro-input {
          background: #ffffff;
          border: 3px solid #000;
          border-radius: 4px;
          padding: 12px 16px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #000;
          width: 100%;
          box-shadow: 2px 2px 0px #000;
        }

        .retro-input:focus {
          outline: none;
          box-shadow: 4px 4px 0px #000;
        }

        /* Status indicators */
        .status-bar {
          background: #333;
          border: 2px solid #000;
          border-radius: 4px;
          height: 16px;
          overflow: hidden;
          position: relative;
        }

        .status-fill {
          height: 100%;
          transition: width 0.3s ease;
          position: relative;
        }

        .health-fill {
          background: #ff0000;
        }

        .happiness-fill {
          background: #ffdd00;
        }

        /* Cursor styles */
        .retro-cursor {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" fill="white" stroke="black" stroke-width="2"/></svg>'), auto;
        }

        /* Pixel art effects */
        .pixel-art {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        /* Grid layout for pet selection */
        .pet-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 40px 0;
        }

        /* Additional options */
        .additional-options {
          text-align: center;
          margin: 20px 0;
        }

        .additional-options p {
          color: #000;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          margin: 8px 0;
        }
      `}</style>
    </div>
  )
}
