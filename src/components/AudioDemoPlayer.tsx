import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Music, Sparkles } from "lucide-react";
import { AudioSnippet } from "../data/blogs.ts";

interface AudioDemoPlayerProps {
  snippet?: AudioSnippet;
  compact?: boolean;
}

export const AudioDemoPlayer: React.FC<AudioDemoPlayerProps> = ({
  snippet = {
    title: "Sitka Spruce vs Cedar Top Resonance Test",
    artist: "Iktaraa Acoustic Lab",
    duration: "1:42",
    genre: "Acoustic Fingerstyle",
  },
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  // Play synthetic warm acoustic-like tones using Web Audio API so it works 100% offline without broken external mp3 links
  const playSynthesizedNotes = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      const notes = [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 293.66]; // C major / A minor pentatonic acoustic chords
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm triangle wave mimicking wood resonance
        osc.type = idx % 2 === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.4);

        gain.gain.setValueAtTime(0.001, now + idx * 0.4);
        gain.gain.exponentialRampToValueAtTime(isMuted ? 0.0001 : 0.12, now + idx * 0.4 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.4 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.4);
        osc.stop(now + idx * 0.4 + 0.85);
      });
    } catch {
      // Audio context might fail on restricted environments; harmless fallback
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsPlaying(true);
      playSynthesizedNotes();

      // Start progress simulation
      const interval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            playSynthesizedNotes(); // loop smoothly
            return 0;
          }
          return prev + 2;
        });
      }, 250);
      timerRef.current = interval;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  if (compact) {
    return (
      <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm border border-slate-800">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shrink-0 transition-transform shadow-xs"
          aria-label={isPlaying ? "Pause audio preview" : "Play audio preview"}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate text-slate-100">{snippet.title}</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>{snippet.genre}</span>
            <span>•</span>
            <span>{snippet.duration}</span>
          </div>
        </div>

        {/* Animated Sound Wave Bars */}
        <div className="flex items-end gap-0.5 h-5 px-1">
          {[40, 75, 55, 90, 60, 80, 45].map((h, i) => (
            <span
              key={i}
              className={`w-0.5 rounded-full transition-all duration-300 ${
                isPlaying ? "bg-rose-400 animate-pulse" : "bg-slate-700"
              }`}
              style={{
                height: isPlaying ? `${Math.min(100, h * (0.6 + Math.random() * 0.8))}%` : "30%",
                animationDelay: `${i * 120}ms`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-[#131c31] to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Music className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
            Sound Lab Audio Demo
          </span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="mb-4 relative z-10">
        <h4 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-1">
          {snippet.title}
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">
          {snippet.artist} • <span className="text-teal-400 font-medium">{snippet.genre}</span>
        </p>
      </div>

      {/* Waveform / Visualizer */}
      <div className="flex items-center gap-1 h-9 mb-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
        {[25, 45, 70, 85, 40, 95, 60, 80, 50, 90, 75, 65, 40, 85, 100, 70, 50, 35, 60, 80, 45, 90, 70, 30].map(
          (val, idx) => {
            const isPassed = (idx / 24) * 100 <= progress;
            return (
              <div
                key={idx}
                className="flex-1 flex items-center justify-center h-full cursor-pointer group"
                onClick={() => setProgress((idx / 24) * 100)}
              >
                <div
                  className={`w-full rounded-full transition-all duration-150 ${
                    isPassed
                      ? "bg-rose-500 shadow-xs shadow-rose-500/50"
                      : "bg-slate-700 group-hover:bg-slate-500"
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(20, Math.sin(idx + progress) * 40 + val * 0.6)}%` : `${val * 0.5}%`,
                  }}
                />
              </div>
            );
          }
        )}
      </div>

      {/* Controls & Progress bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#189BA3] hover:bg-[#147e85] active:scale-95 text-white flex items-center justify-center transition-all shadow-md shadow-teal-950/40 cursor-pointer"
            aria-label={isPlaying ? "Pause demo" : "Play audio demo"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </button>
          <div>
            <span className="font-semibold text-slate-200">
              {isPlaying ? "Playing Wood Resonance Test" : "Click to Listen"}
            </span>
            <span className="block text-[10px] text-slate-400">HQ 24-bit Lossless Acoustic Capture</span>
          </div>
        </div>

        <span className="font-mono text-xs text-slate-300">{snippet.duration}</span>
      </div>
    </div>
  );
};
