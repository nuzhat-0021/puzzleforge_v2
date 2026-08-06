import React from 'react';
import { motion } from 'framer-motion';

export default function LandingPage({ onPlay }) {
  return (
    <div
      className="relative w-full h-full bg-cover bg-center flex flex-col items-center justify-between py-16 overflow-hidden select-none"
      style={{ backgroundImage: "url('/temple_bg.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black/30 pointer-events-none z-0" />
      <div />

      {/* ========================================== */}
      {/* 2D ANIMATED MOVIE BREEZE (PATH FORMING & TRAIL DISSOLVING) */}
      {/* ========================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <svg
          className="w-full h-full max-w-7xl max-h-[600px] overflow-visible"
          viewBox="0 0 1400 400"
          fill="none"
        >
          <defs>
            {/* Soft Luminous Breeze Gradient */}
            <linearGradient id="breezeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
              <stop offset="25%" stopColor="rgba(255, 255, 255, 0.95)" />
              <stop offset="65%" stopColor="rgba(34, 211, 238, 0.85)" />
              <stop offset="100%" stopColor="rgba(192, 132, 252, 0)" />
            </linearGradient>

            <linearGradient id="breezeGradientSoft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
              <stop offset="40%" stopColor="rgba(255, 255, 255, 0.7)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>

            {/* Glowing Soft Glow Filter */}
            <filter id="breezeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Main Flowing Breeze Path: Forming & Dissolving Trail */}
          <motion.path
            d="M 50,220 C 220,100 380,300 580,180 C 740,80 880,260 1080,140 C 1220,50 1320,160 1380,110"
            stroke="url(#breezeGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#breezeGlow)"
            initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 0.45, 0.45, 0],
              pathOffset: [0, 0.1, 0.55, 1],
              opacity: [0, 0.9, 0.9, 0]
            }}
            transition={{
              duration: 4.2,
              repeat: Infinity,
              repeatDelay: 2.2,
              ease: 'easeInOut'
            }}
          />

          {/* Secondary Parallel Wisp Line */}
          <motion.path
            d="M 120,240 C 270,120 420,310 620,200 C 780,100 920,270 1120,160 C 1240,80 1330,170 1390,130"
            stroke="url(#breezeGradientSoft)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#breezeGlow)"
            initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 0.35, 0.35, 0],
              pathOffset: [0, 0.15, 0.6, 1],
              opacity: [0, 0.75, 0.75, 0]
            }}
            transition={{
              duration: 4.2,
              delay: 0.3,
              repeat: Infinity,
              repeatDelay: 2.2,
              ease: 'easeInOut'
            }}
          />

          {/* Drifting Sparkling Wind Specks (Matching Reference Image) */}
          {[
            { cx: 320, cy: 170, delay: 0.8 },
            { cx: 580, cy: 190, delay: 1.4 },
            { cx: 820, cy: 160, delay: 2.0 },
            { cx: 1040, cy: 150, delay: 2.6 },
          ].map((sparkle, idx) => (
            <motion.circle
              key={idx}
              cx={sparkle.cx}
              cy={sparkle.cy}
              r="2.5"
              fill="#FFFFFF"
              filter="url(#breezeGlow)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 0.9, 0],
                x: [0, 40],
                y: [0, -20]
              }}
              transition={{
                duration: 2.0,
                delay: sparkle.delay,
                repeat: Infinity,
                repeatDelay: 4.4,
                ease: 'easeOut'
              }}
            />
          ))}
        </svg>
      </div>

      {/* Glowing Titles */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <motion.h1
          initial={{ x: 250, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-7xl md:text-9xl font-black tracking-widest text-cyan-300 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)] leading-none"
        >
          PUZZLE
        </motion.h1>
        <motion.h1
          initial={{ x: -250, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black tracking-widest text-purple-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.8)] leading-none"
        >
          FORGE
        </motion.h1>
      </div>

      {/* PLAY Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7 }}
        onClick={onPlay}
        className="relative z-10 px-12 py-4 bg-purple-200 text-purple-950 font-black text-2xl rounded-2xl shadow-[0_0_35px_rgba(168,85,247,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        PLAY
      </motion.button>
    </div>
  );
}
