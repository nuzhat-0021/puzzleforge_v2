import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import MainGamePage from './components/MainGamePage';

export default function App() {
  // Navigation & Tear Transition States
  const [page, setPage] = useState('landing'); // 'landing' | 'main'
  const [isTearing, setIsTearing] = useState(false);

  // Transition from Landing -> Main Page via 3.0s Paper Tear Transition
  const handleStartPlay = () => {
    setIsTearing(true);
    setPage('main'); // Immediately render MainGamePage behind the paper tear
    setTimeout(() => {
      setIsTearing(false);
    }, 3000);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 font-sans text-slate-100">
      {/* SVG ClipPath & Filter Defs for Realistic Jagged Torn Paper Edges */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Top Torn Panel ClipPath */}
          <clipPath id="topTornClip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 1,0 L 1,0.42 C 0.95,0.45 0.9,0.39 0.83,0.46 C 0.77,0.52 0.72,0.44 0.65,0.49 C 0.58,0.54 0.52,0.47 0.45,0.51 C 0.38,0.55 0.31,0.48 0.24,0.53 C 0.17,0.57 0.09,0.49 0,0.52 Z" />
          </clipPath>

          {/* Bottom Torn Panel ClipPath */}
          <clipPath id="bottomTornClip" clipPathUnits="objectBoundingBox">
            <path d="M 0,1 L 1,1 L 1,0.46 C 0.94,0.49 0.88,0.43 0.81,0.50 C 0.75,0.56 0.7,0.48 0.63,0.53 C 0.56,0.58 0.5,0.51 0.43,0.55 C 0.36,0.59 0.29,0.52 0.22,0.57 C 0.15,0.61 0.08,0.53 0,0.56 Z" />
          </clipPath>

          {/* Torn Edge Shadow Filter */}
          <filter id="tornShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>
      </svg>

      {/* PAGE 1: LANDING SCREEN */}
      {page === 'landing' && <LandingPage onPlay={handleStartPlay} />}

      {/* 3.0-SECOND JAGGED PAPER TEAR OVERLAY (RIGHT TO LEFT) */}
      <AnimatePresence>
        {isTearing && (
          <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
            {/* Top Torn Panel (Ripped Paper with Fiber Fringe) */}
            <motion.div
              initial={{ y: '0%', rotate: 0 }}
              animate={{
                y: '-65%',
                rotate: -4,
                x: '-10%'
              }}
              transition={{ duration: 3.0, ease: [0.4, 0.0, 0.2, 1] }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/temple_bg.jpeg')",
                clipPath: "url(#topTornClip)",
                filter: "url(#tornShadow)"
              }}
            >
              {/* Dark Ambient Overlay on Landing Tear */}
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>

            {/* Top Paper Fiber Border Highlight (White Torn Edge) */}
            <motion.svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 600"
              preserveAspectRatio="none"
              initial={{ y: '0%', rotate: 0 }}
              animate={{ y: '-65%', rotate: -4, x: '-10%' }}
              transition={{ duration: 3.0, ease: [0.4, 0.0, 0.2, 1] }}
            >
              <path
                d="M 0,312 C 90,294 170,342 240,318 C 310,288 380,330 450,306 C 520,282 580,324 650,294 C 720,264 770,312 830,276 C 900,234 950,270 1000,252"
                stroke="#F8FAFC"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.7))" }}
              />
              <path
                d="M 0,312 C 90,294 170,342 240,318 C 310,288 380,330 450,306 C 520,282 580,324 650,294 C 720,264 770,312 830,276 C 900,234 950,270 1000,252"
                stroke="#CBD5E1"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </motion.svg>

            {/* Bottom Torn Panel (Ripped Paper with Fiber Fringe) */}
            <motion.div
              initial={{ y: '0%', rotate: 0 }}
              animate={{
                y: '65%',
                rotate: 4,
                x: '-10%'
              }}
              transition={{ duration: 3.0, ease: [0.4, 0.0, 0.2, 1] }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/temple_bg.jpeg')",
                clipPath: "url(#bottomTornClip)",
                filter: "url(#tornShadow)"
              }}
            >
              {/* Dark Ambient Overlay on Landing Tear */}
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>

            {/* Bottom Paper Fiber Border Highlight (White Torn Edge) */}
            <motion.svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 600"
              preserveAspectRatio="none"
              initial={{ y: '0%', rotate: 0 }}
              animate={{ y: '65%', rotate: 4, x: '-10%' }}
              transition={{ duration: 3.0, ease: [0.4, 0.0, 0.2, 1] }}
            >
              <path
                d="M 0,336 C 80,318 150,366 220,342 C 290,312 360,354 430,330 C 500,306 560,348 630,318 C 700,288 750,336 810,300 C 880,258 940,294 1000,276"
                stroke="#F8FAFC"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.7))" }}
              />
              <path
                d="M 0,336 C 80,318 150,366 220,342 C 290,312 360,354 430,330 C 500,306 560,348 630,318 C 700,288 750,336 810,300 C 880,258 940,294 1000,276"
                stroke="#CBD5E1"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </motion.svg>
          </div>
        )}
      </AnimatePresence>

      {/* PAGE 2 & 3: MAIN GAME PAGE */}
      {page === 'main' && <MainGamePage />}
    </div>
  );
}