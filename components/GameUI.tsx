'use client'

import { motion } from 'framer-motion'

interface GameUIProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export default function GameUI({ children, title, className = '' }: GameUIProps) {
  return (
    <div className={`game-ui ${className}`}>
      {/* Retro game border */}
      <div className="game-border">
        <div className="game-border-inner">
          {title && (
            <div className="game-title">
              <h1 className="pixel-text text-2xl font-bold text-yellow-400">
                {title}
              </h1>
            </div>
          )}
          {children}
        </div>
      </div>

      <style jsx>{`
        .game-ui {
          position: relative;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          border-radius: 8px;
          overflow: hidden;
        }

        .game-border {
          position: relative;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
          background-size: 400% 400%;
          animation: gradientShift 3s ease infinite;
          padding: 4px;
          border-radius: 8px;
        }

        .game-border-inner {
          background: #1a1a2e;
          border-radius: 4px;
          padding: 20px;
          position: relative;
        }

        .game-title {
          text-align: center;
          margin-bottom: 20px;
          position: relative;
        }

        .game-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ffd700, transparent);
        }

        .pixel-text {
          font-family: 'Courier New', monospace;
          text-shadow: 2px 2px 0px #000;
          letter-spacing: 1px;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Retro button styles */
        .game-button {
          background: linear-gradient(145deg, #ff6b6b, #ee5a52);
          border: 2px solid #000;
          border-radius: 4px;
          padding: 12px 24px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #fff;
          text-shadow: 1px 1px 0px #000;
          cursor: pointer;
          transition: all 0.1s ease;
          position: relative;
          box-shadow: 4px 4px 0px #000;
        }

        .game-button:hover {
          transform: translateY(-2px);
          box-shadow: 6px 6px 0px #000;
        }

        .game-button:active {
          transform: translateY(2px);
          box-shadow: 2px 2px 0px #000;
        }

        /* Health bar */
        .health-bar {
          background: #333;
          border: 2px solid #000;
          border-radius: 4px;
          height: 20px;
          overflow: hidden;
          position: relative;
        }

        .health-fill {
          background: linear-gradient(90deg, #ff0000, #ff6b6b);
          height: 100%;
          transition: width 0.3s ease;
          position: relative;
        }

        .health-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Happiness bar */
        .happiness-bar {
          background: #333;
          border: 2px solid #000;
          border-radius: 4px;
          height: 20px;
          overflow: hidden;
          position: relative;
        }

        .happiness-fill {
          background: linear-gradient(90deg, #ffd700, #ffed4e);
          height: 100%;
          transition: width 0.3s ease;
          position: relative;
        }

        .happiness-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }

        /* Pixel art effects */
        .pixel-art {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        /* Retro card styles */
        .game-card {
          background: linear-gradient(145deg, #2c3e50, #34495e);
          border: 3px solid #000;
          border-radius: 8px;
          padding: 20px;
          position: relative;
          box-shadow: 6px 6px 0px #000;
        }

        .game-card::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
          background-size: 400% 400%;
          animation: gradientShift 3s ease infinite;
          border-radius: 8px;
          z-index: -1;
        }
      `}</style>
    </div>
  )
}
