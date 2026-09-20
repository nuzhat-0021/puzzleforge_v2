import React, { useEffect, useRef } from 'react';
import { useRoom } from '../../context/RoomContext';
import { Volume2, VolumeX, CloudRain, Flame, Music, X } from 'lucide-react';

export function AudioPlayer({ isOpen, onClose }) {
  const { audioState, setAudioState } = useRoom();
  const audioCtxRef = useRef(null);
  const rainNoiseNodeRef = useRef(null);

  // Initialize Web Audio API synth for Rain & Ambient
  useEffect(() => {
    if (!audioState.rainSoundActive) {
      if (rainNoiseNodeRef.current) {
        try {
          rainNoiseNodeRef.current.stop();
          rainNoiseNodeRef.current.disconnect();
        } catch (e) {}
        rainNoiseNodeRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;

      // Create Rain Pink Noise Buffer
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.05;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter for rain softness
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      const gainNode = ctx.createGain();
      gainNode.gain.value = audioState.volume * 0.4;

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noise.start();
      rainNoiseNodeRef.current = noise;
    } catch (e) {
      console.warn('Audio Context error', e);
    }
  }, [audioState.rainSoundActive, audioState.volume]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md pointer-events-auto">
      <div className="cozy-glass w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-amber-500/30 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-300/60 hover:text-amber-100 p-1.5 rounded-xl hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <Music className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-cozy text-lg font-bold text-amber-100">
              Cozy Soundscapes
            </h2>
            <p className="text-xs text-amber-300/70">Lo-Fi & Ambient audio generators</p>
          </div>
        </div>

        {/* Ambient Controls */}
        <div className="space-y-3 mb-5">
          {/* Rain toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <CloudRain className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-bold text-amber-100">Window Rain</span>
            </div>
            <button
              onClick={() =>
                setAudioState((prev) => ({
                  ...prev,
                  rainSoundActive: !prev.rainSoundActive
                }))
              }
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                audioState.rainSoundActive
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white/10 text-amber-200/60'
              }`}
            >
              {audioState.rainSoundActive ? 'Active' : 'Off'}
            </button>
          </div>

          {/* Master Volume */}
          <div className="p-3 rounded-2xl bg-black/30 border border-amber-500/20">
            <div className="flex items-center justify-between text-xs text-amber-200 mb-2">
              <span className="font-bold flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Master Volume
              </span>
              <span className="font-mono">{Math.round(audioState.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioState.volume}
              onChange={(e) =>
                setAudioState((prev) => ({
                  ...prev,
                  volume: parseFloat(e.target.value)
                }))
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
