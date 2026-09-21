import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CreatorBoard from './CreatorBoard';
import PlayerEscapeView from './PlayerEscapeView';
import { getRoomByCode, getRandomCommunityRoom, getLeaderboardRuns } from '../utils/communityRoomPool';
import { supabase } from '../lib/supabaseClient';
import { fireDualConfetti } from '../utils/confettiBlast';

const DungeonVaultEditor = lazy(() => import('./DungeonVaultEditor'));

export default function MainGamePage() {
  // Navigation & Tour States
  const [showStory, setShowStory] = useState(false); // Default false so it doesn't overlap tear animation
  const [tourIndex, setTourIndex] = useState(-1); // -1: inactive, 0: Top-Right, 1: Top-Left, 2: Player, 3: Creator
  const [activeModal, setActiveModal] = useState(null); // 'player' | 'creator' | 'login' | 'settings' | 'achievements' | 'leaderboard'
  const [forgingTemplate, setForgingTemplate] = useState(null);
  const [playingRoom, setPlayingRoom] = useState(null); // 'dungeon' | etc.

  // User Auth & Session States
  const [currentUser, setCurrentUser] = useState(null);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Restore User Session & Supabase Session on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pf_user_session');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {}

    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const userMeta = session.user.user_metadata || {};
          const userObj = {
            id: session.user.id,
            email: session.user.email,
            username: userMeta.username || session.user.email.split('@')[0],
            isGuest: false
          };
          setCurrentUser(userObj);
          localStorage.setItem('pf_user_session', JSON.stringify(userObj));
        }
      });
    } catch (e) {}
  }, []);

  // Initial Onboarding Story Trigger: ONLY for first-time visitors (Wait 3.5s total after mount)
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('pf_walkthrough_completed');
      if (hasSeen === 'true') {
        return; // Returning player: Skip story & tour completely!
      }
    } catch (e) {}

    const timer = setTimeout(() => {
      setShowStory(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Typewriter story text
  const fullStoryText = "Welcome to PuzzleForge—a realm forged in shadows and ancient puzzles. Here, mind and mechanics intertwine. Step into community-crafted escape chambers, crack complex codes, or harness the Forge to construct your own 3D labyrinth of trials. Your escape begins now.";
  const [typedText, setTypedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Sub-modal internal states
  const [playerMode, setPlayerMode] = useState('community'); // 'community' vs 'code'
  const [roomCode, setRoomCode] = useState('');
  const [masterAudio, setMasterAudio] = useState(true);
  const [musicVol, setMusicVol] = useState(80);
  const [sfxVol, setSfxVol] = useState(90);

  // Pre-calculated Dust Particles (Performance Optimized, No Re-renders)
  const dustParticles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.8 + 3) % 95}%`,
      top: `${(i * 7.2 + 8) % 85}%`,
      size: (i % 3) + 1.8, // 1.8px - 3.8px
      duration: 14 + (i % 7) * 2.2, // 14s - 27s
      delay: (i % 5) * 1.2,
      opacity: 0.2 + (i % 4) * 0.12, // 0.2 - 0.56
      deltaX: (i % 2 === 0 ? 1 : -1) * (15 + (i % 5) * 6),
    }));
  }, []);

  // Typewriter effect when story parchment is active
  useEffect(() => {
    if (showStory) {
      setTypedText("");
      setIsTypingComplete(false);
      let i = 0;
      const timer = setInterval(() => {
        if (i < fullStoryText.length) {
          setTypedText(fullStoryText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
          setIsTypingComplete(true);
        }
      }, 25);
      return () => clearInterval(timer);
    }
  }, [showStory]);

  const finishTypingInstantly = () => {
    setTypedText(fullStoryText);
    setIsTypingComplete(true);
  };

  // Dismiss Story Card -> Starts Step-by-Step Tour
  const handleDismissStory = () => {
    setShowStory(false);
    setTourIndex(0); // Immediately opens Step 1 (Top-Right Icons)
    try {
      localStorage.setItem('pf_walkthrough_completed', 'true');
    } catch (e) {}
  };

  // Advance Guided Tour
  const handleNextTourStep = () => {
    if (tourIndex < 3) {
      setTourIndex(tourIndex + 1);
    } else {
      setTourIndex(-1); // Tour finished
      try {
        localStorage.setItem('pf_walkthrough_completed', 'true');
      } catch (e) {}
    }
  };

  // Password Complexity Verification
  const passwordHasMinLen = authPassword.length >= 8;
  const passwordHasNumber = /\d/.test(authPassword);
  const passwordHasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(authPassword);
  const isPasswordValid = passwordHasMinLen && passwordHasNumber && passwordHasSpecial;

  // Guest Login Handler
  const handleGuestLogin = () => {
    const guestObj = {
      id: 'guest_' + Date.now(),
      username: 'Guest_' + Math.floor(1000 + Math.random() * 9000),
      email: 'guest@puzzleforge.local',
      isGuest: true
    };
    setCurrentUser(guestObj);
    try {
      localStorage.setItem('pf_user_session', JSON.stringify(guestObj));
    } catch (e) {}
    setActiveModal(null);
    setAuthError('');
    setAuthSuccess('');
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    try {
      localStorage.removeItem('pf_user_session');
    } catch (e) {}
    setCurrentUser(null);
    setActiveModal(null);
  };

  // Register Handler
  const handleRegister = async (e) => {
    e?.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail.trim() || !authUsername.trim()) {
      setAuthError('Please provide both email and a PuzzleForge username.');
      return;
    }
    if (!isPasswordValid) {
      setAuthError('Password must meet all 3 security requirements below.');
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail.trim(),
        password: authPassword,
        options: {
          data: { username: authUsername.trim() }
        }
      });

      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        return;
      }

      // Fire Dual Confetti on successful registration 🎉
      fireDualConfetti();

      const newUser = {
        id: data.user?.id || 'usr_' + Date.now(),
        email: authEmail.trim(),
        username: authUsername.trim(),
        isGuest: false
      };
      setCurrentUser(newUser);
      try {
        localStorage.setItem('pf_user_session', JSON.stringify(newUser));
      } catch (e) {}

      setAuthSuccess(`🎉 Account created! Welcome, ${authUsername.trim()}!`);
      setTimeout(() => {
        setActiveModal(null);
        setAuthSuccess('');
        setAuthLoading(false);
        setAuthPassword('');
      }, 1600);
    } catch (err) {
      // Offline fallback
      fireDualConfetti();
      const newUser = {
        id: 'usr_' + Date.now(),
        email: authEmail.trim(),
        username: authUsername.trim(),
        isGuest: false
      };
      setCurrentUser(newUser);
      try {
        localStorage.setItem('pf_user_session', JSON.stringify(newUser));
      } catch (e) {}
      setAuthSuccess(`🎉 Account created! Welcome, ${authUsername.trim()}!`);
      setTimeout(() => {
        setActiveModal(null);
        setAuthSuccess('');
        setAuthLoading(false);
        setAuthPassword('');
      }, 1600);
    }
  };

  // Login Handler
  const handleLogin = async (e) => {
    e?.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter your email and passcode.');
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword
      });

      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        return;
      }

      const userMeta = data.user?.user_metadata || {};
      const loggedUser = {
        id: data.user?.id,
        email: data.user?.email,
        username: userMeta.username || data.user?.email?.split('@')[0] || 'Architect',
        isGuest: false
      };
      setCurrentUser(loggedUser);
      try {
        localStorage.setItem('pf_user_session', JSON.stringify(loggedUser));
      } catch (e) {}

      setActiveModal(null);
      setAuthLoading(false);
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check credentials.');
      setAuthLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full select-none text-slate-100 font-sans overflow-hidden">
      
      {/* 2. BACKGROUND BREATHING (Slow Scale 1 -> 1.015 -> 1 over 30s) */}
      <motion.div
        animate={{ scale: [1, 1.015, 1] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${
          showStory || tourIndex !== -1 || activeModal !== null ? 'filter blur-md brightness-75' : ''
        }`}
        style={{ backgroundImage: "url('/main_bg.jpeg')" }}
      />

      {/* 3. CEILING LIGHT FLICKER (Subtle Fluorescent Flicker every 14s, < 250ms) */}
      <motion.div
        animate={{
          opacity: [0, 0, 0.12, 0.02, 0.18, 0, 0]
        }}
        transition={{
          duration: 0.25,
          repeat: Infinity,
          repeatDelay: 15,
          ease: 'linear'
        }}
        className="absolute inset-0 bg-amber-100/10 mix-blend-overlay pointer-events-none z-10"
      />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none z-10" />

      {/* VOLUMETRIC CEILING LIGHT BEAM (GOD RAY) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.18, 0.28, 0.18]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -top-10 left-[38%] w-[420px] h-[90%] bg-gradient-to-b from-cyan-100/30 via-cyan-200/12 to-transparent blur-2xl mix-blend-screen -rotate-12 transform origin-top-left"
        />
      </div>

      {/* 1. FLOATING DUST PARTICLES (Behind UI, Above Background, 60 FPS) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {dustParticles.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              x: [0, p.deltaX, 0],
              y: [0, -60, 0],
              opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              borderRadius: '50%',
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.4)',
              pointerEvents: 'none'
            }}
          />
        ))}
      </div>

      {/* 4. SOFT FLOOR FOG (Bottom Layer, Slow Horizontal Drift, Never Covers UI) */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10 overflow-hidden">
        <motion.div
          animate={{
            x: ['-5%', '5%', '-5%']
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="w-[110%] h-full -ml-[5%] bg-gradient-to-t from-slate-400/12 via-slate-300/5 to-transparent blur-2xl"
        />
      </div>

      {/* ------------------------------------------ */}
      {/* TOP-LEFT GROUP: Achievements & Leaderboard */}
      {/* ------------------------------------------ */}
      <div
        className={`fixed top-6 left-8 z-30 flex items-center gap-3 transition-all duration-300 ${
          tourIndex === 1 ? 'ring-4 ring-amber-400/80 rounded-full p-1 bg-slate-900/90' : ''
        }`}
      >
        <button
          onClick={() => setActiveModal('achievements')}
          className="w-12 h-12 rounded-full bg-slate-950/85 border border-amber-500/50 text-amber-400 flex items-center justify-center hover:scale-110 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer backdrop-blur-md"
          title="Achievements"
        >
          🏆
        </button>
        <button
          onClick={() => setActiveModal('leaderboard')}
          className="w-12 h-12 rounded-full bg-slate-950/85 border border-cyan-500/50 text-cyan-400 flex items-center justify-center hover:scale-110 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer backdrop-blur-md"
          title="Leaderboard"
        >
          📊
        </button>
      </div>

      {/* ------------------------------------------ */}
      {/* TOP-RIGHT GROUP: Login, Settings, Lore Note Icon */}
      {/* ------------------------------------------ */}
      <div
        className={`fixed top-6 right-8 z-30 flex items-center gap-3 transition-all duration-300 ${
          tourIndex === 0 ? 'ring-4 ring-purple-400/80 rounded-full p-1 bg-slate-900/90' : ''
        }`}
      >
        {/* Story Lore Circular Note Icon (📜) */}
        <button
          onClick={() => {
            setShowStory(true);
            setTourIndex(-1);
          }}
          className="w-12 h-12 rounded-full bg-slate-950/85 border border-amber-500/50 text-amber-300 flex items-center justify-center hover:scale-110 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer backdrop-blur-md"
          title="PuzzleForge Lore & Story"
        >
          📜
        </button>

        {/* User Account Profile or Login Button */}
        {currentUser ? (
          <button
            onClick={() => setActiveModal('account_profile')}
            className="h-12 px-3.5 sm:px-4 rounded-full bg-slate-950/90 border border-purple-500/60 text-purple-200 flex items-center gap-2 hover:scale-105 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer backdrop-blur-md font-semibold text-sm"
            title="My Account Profile"
          >
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
              {currentUser.username.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-[100px] sm:max-w-[130px] truncate">{currentUser.username}</span>
            <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold ${
              currentUser.isGuest ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}>
              {currentUser.isGuest ? 'GUEST' : 'ARCHITECT'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => {
              setAuthError('');
              setAuthSuccess('');
              setActiveModal('login');
            }}
            className="w-12 h-12 rounded-full bg-slate-950/85 border border-purple-500/50 text-purple-300 flex items-center justify-center hover:scale-110 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer backdrop-blur-md"
            title="Login / Signup"
          >
            👤
          </button>
        )}

        {/* Settings Gear Icon */}
        <button
          onClick={() => setActiveModal('settings')}
          className="w-12 h-12 rounded-full bg-slate-950/85 border border-slate-700 text-slate-300 flex items-center justify-center hover:scale-110 hover:border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.2)] transition-all cursor-pointer backdrop-blur-md"
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {/* ------------------------------------------ */}
      {/* MID-LEFT RECTANGULAR CARD: PLAYER BUTTON */}
      {/* ------------------------------------------ */}
      <div
        className={`fixed top-1/2 -translate-y-1/2 left-[20%] md:left-[22%] z-20 transition-all duration-300 ${
          tourIndex === 2 ? 'ring-4 ring-cyan-400/90 rounded-2xl scale-105' : ''
        }`}
      >
        <button
          onClick={() => setActiveModal('player')}
          className="w-56 h-32 bg-slate-950/85 border-2 border-cyan-500/50 hover:border-cyan-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform">🎮</span>
          <span className="text-2xl font-black tracking-widest text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            PLAYER
          </span>
          <span className="text-[10px] text-cyan-200/70 font-semibold uppercase tracking-widest">
            Community Rooms
          </span>
        </button>
      </div>

      {/* ------------------------------------------ */}
      {/* MID-RIGHT RECTANGULAR CARD: CREATOR BUTTON */}
      {/* ------------------------------------------ */}
      <div
        className={`fixed top-1/2 -translate-y-1/2 right-[20%] md:right-[22%] z-20 transition-all duration-300 ${
          tourIndex === 3 ? 'ring-4 ring-purple-400/90 rounded-2xl scale-105' : ''
        }`}
      >
        <button
          onClick={() => setActiveModal('creator')}
          className="w-56 h-32 bg-slate-950/85 border-2 border-purple-500/50 hover:border-purple-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_45px_rgba(168,85,247,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform">🛠️</span>
          <span className="text-2xl font-black tracking-widest text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
            CREATOR
          </span>
          <span className="text-[10px] text-purple-200/70 font-semibold uppercase tracking-widest">
            Forge Studio 3D
          </span>
        </button>
      </div>

      {/* ========================================== */}
      {/* CENTERED OLD-STYLE PARCHMENT PAPER STORY CARD */}
      {/* ========================================== */}
      <AnimatePresence>
        {showStory && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.5 }}
              className="relative max-w-2xl w-[90%] p-8 md:p-12 bg-[#EEDC9A] border-8 border-[#5C4033] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-[#2B1B17] font-serif flex flex-col justify-between"
            >
              {/* Parchment Title */}
              <div>
                <h2 className="tracking-widest text-2xl md:text-3xl font-black mb-6 text-center text-[#3D2B22] border-b-2 border-[#5C4033]/30 pb-3">
                  What is PuzzleForge?
                </h2>

                {/* Story Typewriter Text */}
                <div
                  onClick={finishTypingInstantly}
                  className="text-lg md:text-xl leading-relaxed text-justify mb-8 font-medium font-serif min-h-[140px] cursor-pointer"
                  title="Click to reveal text instantly"
                >
                  <p>{typedText}</p>
                  {!isTypingComplete && (
                    <span className="inline-block w-2 h-5 bg-[#3D2B22] ml-1 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Bottom Action Button */}
              <div className="flex justify-center mt-2">
                <button
                  onClick={handleDismissStory}
                  className="bg-[#5C4033] text-[#EEDC9A] font-bold px-10 py-3.5 rounded border-2 border-[#3D2B22] hover:bg-[#3D2B22] shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 text-base md:text-lg font-mono tracking-wider uppercase flex items-center gap-2"
                >
                  <span>CONTINUE TO EXPLORE</span>
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------ */}
      {/* GUIDED TOUR POPOVER */}
      {/* ------------------------------------------ */}
      {!showStory && tourIndex !== -1 && (
        <div className="fixed inset-0 z-40 bg-black/50 pointer-events-auto flex items-end justify-center pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/95 border border-slate-700 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6 max-w-lg"
          >
            <p className="text-sm font-medium text-slate-200">
              {tourIndex === 0 && "Configure game settings or sign in to save your progress."}
              {tourIndex === 1 && "Track your unlocked trophies, stats, and global rankings."}
              {tourIndex === 2 && "Enter Player Mode to play community rooms or join via Room Code."}
              {tourIndex === 3 && "Enter Creator Studio to build and publish your own 3D escape rooms."}
            </p>
            <button
              onClick={handleNextTourStep}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer shrink-0"
            >
              {tourIndex === 3 ? "FINISH TOUR" : "NEXT →"}
            </button>
          </motion.div>
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* CREATOR BOARD FULL SCREEN SCREEN */}
      {/* ------------------------------------------ */}
      {activeModal === 'creator' && !forgingTemplate && (
        <CreatorBoard
          onBack={() => setActiveModal(null)}
          onSelectTemplate={(templateId) => {
            setForgingTemplate(templateId);
            setActiveModal(null);
          }}
        />
      )}

      {/* ------------------------------------------ */}
      {/* ------------------------------------------ */}
        {/* 3D PLAYER ESCAPE MODE VIEWPORT */}
        {/* ------------------------------------------ */}
        {playingRoom && (
          <Suspense
            fallback={
              <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 bg-slate-900/90 border border-cyan-500/30 p-6 rounded-2xl backdrop-blur-md shadow-2xl">
                  <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold text-cyan-300 tracking-wider uppercase font-mono">
                    Loading Escape Vault...
                  </span>
                </div>
              </div>
            }
          >
            <PlayerEscapeView
              room={playingRoom}
              onExit={() => setPlayingRoom(null)}
              onPlayAnother={async () => {
                const next = await getRandomCommunityRoom(playingRoom.room_code);
                setPlayingRoom(next);
              }}
            />
          </Suspense>
        )}

        {/* ------------------------------------------ */}
        {/* MULTI-ROOM DUNGEON VAULT 3D EDITOR */}
      {/* ------------------------------------------ */}
      {forgingTemplate && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 bg-slate-900/90 border border-amber-500/30 p-6 rounded-2xl backdrop-blur-md shadow-2xl">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-bold text-amber-300 tracking-wider uppercase font-mono">
                  Loading Multi-Room Dungeon Vault 3D...
                </span>
              </div>
            </div>
          }
        >
          <DungeonVaultEditor
            onBack={() => {
              setForgingTemplate(null);
              setActiveModal('creator');
            }}
            onConfirmLayout={(placedObjects) => {
              alert(`Layout Confirmed with ${placedObjects.length} active 3D props! Transitioning to Stage 4 Logic Builder...`);
            }}
          />
        </Suspense>
      )}

      {/* ------------------------------------------ */}
      {/* INTERACTIVE MODAL OVERLAYS (NON-CREATOR) */}
      {/* ------------------------------------------ */}
      <AnimatePresence>
        {activeModal && activeModal !== 'creator' && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl text-slate-100"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
              >
                ✕
              </button>

              {/* MODAL 1: PLAYER MODE */}
              {activeModal === 'player' && (
                <div className="flex flex-col gap-6">
                  <h3 className="text-2xl font-black text-cyan-300 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <span>🎮</span> Player Mode
                  </h3>
                  <div className="flex flex-col gap-3">
                    <label
                      onClick={() => setPlayerMode('community')}
                      className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        playerMode === 'community'
                          ? 'bg-cyan-950/60 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="playerMode"
                        checked={playerMode === 'community'}
                        onChange={() => setPlayerMode('community')}
                        className="accent-cyan-500"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-base text-cyan-300">Play Community Room</span>
                        <span className="text-xs text-slate-400">Step into community-crafted 3D escape chambers.</span>
                      </div>
                    </label>

                    <label
                      onClick={() => setPlayerMode('code')}
                      className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        playerMode === 'code'
                          ? 'bg-cyan-950/60 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="playerMode"
                        checked={playerMode === 'code'}
                        onChange={() => setPlayerMode('code')}
                        className="accent-cyan-500"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-base text-blue-300">Enter Room Code</span>
                        <span className="text-xs text-slate-400">Join a private room via invite passcode.</span>
                      </div>
                    </label>
                  </div>

                  {playerMode === 'code' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Passcode</label>
                      <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="e.g. FORGE-892"
                        className="bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-slate-200 text-sm font-mono tracking-widest uppercase outline-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      if (playerMode === 'code') {
                        if (!roomCode.trim()) {
                          alert('Please enter a room code (e.g. FORGE-DEMO or a code from your friend)!');
                          return;
                        }
                        const found = await getRoomByCode(roomCode);
                        if (!found) {
                          alert(`Room code "${roomCode}" was not found! Please check the code or try "Play Community Room".`);
                          return;
                        }
                        setPlayingRoom(found);
                        setActiveModal(null);
                      } else {
                        const commRoom = await getRandomCommunityRoom();
                        setPlayingRoom(commRoom);
                        setActiveModal(null);
                      }
                    }}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3.5 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all cursor-pointer text-lg tracking-wider"
                  >
                    [ Play ]
                  </button>
                </div>
              )}

              {/* MODAL 3: LOGIN / REGISTER / GUEST PORTAL */}
              {activeModal === 'login' && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-2xl font-black text-purple-300 flex items-center gap-2">
                      <span>👤</span> Account Portal
                    </h3>
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('login');
                          setAuthError('');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          authTab === 'login' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('register');
                          setAuthError('');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          authTab === 'register' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Register
                      </button>
                    </div>
                  </div>

                  {/* Feedback Messages */}
                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{authError}</span>
                    </div>
                  )}
                  {authSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 font-bold animate-bounce">
                      <span>🎉</span>
                      <span>{authSuccess}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={authTab === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-3.5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="architect@puzzleforge.io"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl px-4 py-2.5 text-slate-200 outline-none text-sm"
                      />
                    </div>

                    {/* PuzzleForge Username (Register Only) */}
                    {authTab === 'register' && (
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                          PuzzleForge Username
                        </label>
                        <input
                          type="text"
                          required
                          value={authUsername}
                          onChange={(e) => setAuthUsername(e.target.value)}
                          placeholder="e.g. VaultMaster99"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl px-4 py-2.5 text-slate-200 outline-none text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                        Passcode
                      </label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl px-4 py-2.5 text-slate-200 outline-none text-sm"
                      />
                    </div>

                    {/* Strict Password Rules Indicator (Register Only) */}
                    {authTab === 'register' && (
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Security Requirements:
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={passwordHasMinLen ? "text-emerald-400 font-bold" : "text-slate-500"}>
                            {passwordHasMinLen ? "✓" : "○"}
                          </span>
                          <span className={passwordHasMinLen ? "text-emerald-300" : "text-slate-400"}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={passwordHasNumber ? "text-emerald-400 font-bold" : "text-slate-500"}>
                            {passwordHasNumber ? "✓" : "○"}
                          </span>
                          <span className={passwordHasNumber ? "text-emerald-300" : "text-slate-400"}>
                            Includes at least one number (0-9)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={passwordHasSpecial ? "text-emerald-400 font-bold" : "text-slate-500"}>
                            {passwordHasSpecial ? "✓" : "○"}
                          </span>
                          <span className={passwordHasSpecial ? "text-emerald-300" : "text-slate-400"}>
                            Includes special figure (!@#$%^&*)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm shadow-lg hover:shadow-purple-500/20 mt-1 disabled:opacity-50"
                    >
                      {authLoading ? 'Processing...' : (authTab === 'login' ? 'Sign In to Account' : 'Create My Account 🎉')}
                    </button>
                  </form>

                  {/* PLAY AS GUEST OPTION */}
                  <div className="pt-3 border-t border-slate-800 text-center">
                    <button
                      type="button"
                      onClick={handleGuestLogin}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-amber-600/20 hover:from-amber-600/30 hover:via-orange-600/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer group hover:scale-[1.01]"
                    >
                      <span>🎭</span>
                      <span>Play as Guest</span>
                      <span className="text-[11px] font-normal text-amber-300/70 ml-1">(Instant play, no signup needed)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL 3B: USER PROFILE CARD (WHEN LOGGED IN) */}
              {activeModal === 'account_profile' && currentUser && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3.5 border-b border-slate-800 pb-3">
                    <span className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                      {currentUser.username.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <h3 className="text-xl font-black text-purple-200 flex items-center gap-2">
                        {currentUser.username}
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                          currentUser.isGuest ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {currentUser.isGuest ? 'Guest Adventurer' : 'Verified Architect'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account ID:</span>
                      <span className="font-mono text-purple-300">{currentUser.id.slice(0, 14)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Session Status:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active & Saved
                      </span>
                    </div>
                    {currentUser.isGuest ? (
                      <p className="text-[11px] text-amber-300/80 pt-2 border-t border-slate-800">
                        💡 Playing as Guest. Your created rooms and speedrun times are remembered on this browser. You can register an account anytime to sync to the cloud!
                      </p>
                    ) : (
                      <p className="text-[11px] text-purple-300/80 pt-2 border-t border-slate-800">
                        ✨ Your rooms and leaderboard runs are permanently backed up to the PuzzleForge cloud database!
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex-1 bg-rose-600/80 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm shadow-lg hover:shadow-rose-500/20"
                    >
                      🚪 Log Out
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl transition-all cursor-pointer text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL 4: SETTINGS */}
              {activeModal === 'settings' && (
                <div className="flex flex-col gap-5">
                  <h3 className="text-2xl font-black text-cyan-300 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <span>⚙️</span> Audio & Controls
                  </h3>
                  <div className="flex flex-col gap-4 text-sm">
                    <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="font-semibold text-slate-300">Master Audio</span>
                      <button
                        onClick={() => setMasterAudio(!masterAudio)}
                        className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          masterAudio ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {masterAudio ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between font-semibold text-slate-300">
                        <span>Music Volume</span>
                        <span className="text-purple-400">{musicVol}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={musicVol}
                        onChange={(e) => setMusicVol(Number(e.target.value))}
                        className="accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between font-semibold text-slate-300">
                        <span>SFX Volume</span>
                        <span className="text-cyan-400">{sfxVol}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sfxVol}
                        onChange={(e) => setSfxVol(Number(e.target.value))}
                        className="accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 5: ACHIEVEMENTS */}
              {activeModal === 'achievements' && (
                <div className="flex flex-col gap-5">
                  <h3 className="text-2xl font-black text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <span>🏆</span> Trophies & Badges
                  </h3>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {[
                      { icon: '🔓', title: 'First Escape', desc: 'Cleared room 1', unlocked: true },
                      { icon: '🧩', title: 'Code Breaker', desc: 'Solved 10 puzzles', unlocked: true },
                      { icon: '⚡', title: 'Speed Demon', desc: 'Escape under 3 mins', unlocked: true },
                      { icon: '🛠️', title: 'Master Architect', desc: 'Publish 1 custom 3D room', unlocked: false },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex flex-col gap-1 ${
                          item.unlocked
                            ? 'bg-slate-950 border-amber-500/40 text-amber-200'
                            : 'bg-slate-950/50 border-slate-800 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <span>{item.icon}</span>
                          <span>{item.title}</span>
                        </div>
                        <span className="text-xs text-slate-400">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL 6: LEADERBOARD */}
              {activeModal === 'leaderboard' && (
                <div className="flex flex-col gap-5">
                  <h3 className="text-2xl font-black text-cyan-300 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <span>📊</span> Global Leaderboard
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                        <tr>
                          <th className="p-3">Rank</th>
                          <th className="p-3">Architect</th>
                          <th className="p-3">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        <tr className="hover:bg-slate-950/50">
                          <td className="p-3 font-bold text-amber-400">🥇 1</td>
                          <td className="p-3 font-semibold text-white">ShadowWeaver</td>
                          <td className="p-3 text-cyan-400 font-bold">14,250</td>
                        </tr>
                        <tr className="hover:bg-slate-950/50">
                          <td className="p-3 font-bold text-slate-300">🥈 2</td>
                          <td className="p-3 font-semibold text-white">AetherCoder</td>
                          <td className="p-3 text-cyan-400 font-bold">13,900</td>
                        </tr>
                        <tr className="hover:bg-slate-950/50">
                          <td className="p-3 font-bold text-amber-700">🥉 3</td>
                          <td className="p-3 font-semibold text-white">RuneSeeker</td>
                          <td className="p-3 text-cyan-400 font-bold">12,850</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
