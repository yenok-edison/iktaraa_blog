import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, Disc, Music } from 'lucide-react';

interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  edition: string;
  duration: string;
  url: string;
}

const SAMPLE_TRACKS: AudioTrack[] = [
  {
    id: 'track-1',
    title: 'Kathaipomaa Acoustic Prelude',
    artist: 'Tanpura & Coffee Chimes Live',
    edition: 'Edition 10 · Chennai',
    duration: '0:42',
    url: 'https://cdn.freesound.org/previews/415/415729_5121236-lq.mp3',
  },
  {
    id: 'track-2',
    title: 'Sitar & Spanish Nylon Raga Dialogue',
    artist: 'Farhan Khan & Diego Ramirez',
    edition: 'Iktaraa Unplugged · Bengaluru',
    duration: '0:58',
    url: 'https://cdn.freesound.org/previews/415/415729_5121236-lq.mp3',
  },
  {
    id: 'track-3',
    title: 'Vintage Neve Console Direct-to-Tape',
    artist: 'Sanctuary Acoustic Quartet',
    edition: 'Sound Labs · Hyderabad',
    duration: '0:35',
    url: 'https://cdn.freesound.org/previews/415/415729_5121236-lq.mp3',
  },
];

export const AudioDemoPlayer: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeTrack = SAMPLE_TRACKS[currentTrackIndex];

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback toggle visualization if browser policies block remote mp3
          setIsPlaying(true);
        });
    }
  };

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#231E59] to-[#1c1847] text-white rounded-2xl p-4 border border-white/10 shadow-md">
      <audio
        ref={audioRef}
        src={activeTrack.url}
        onEnded={() => setIsPlaying(false)}
        preload="none"
      />

      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-[#23A2B3]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
            Acoustic Tone Preview
          </h4>
        </div>
        <span className="text-[10px] text-neutral-400">Uncompressed Audio</span>
      </div>

      {/* Now Playing Widget */}
      <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E34060] to-[#23A2B3] flex items-center justify-center shrink-0 ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '4s' }}
          >
            <Disc className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0">
            <h5 className="text-xs font-bold text-white truncate font-heading">
              {activeTrack.title}
            </h5>
            <p className="text-[11px] text-neutral-300 truncate">
              {activeTrack.artist} · <span className="text-[#23A2B3]">{activeTrack.edition}</span>
            </p>
          </div>
        </div>

        {/* Play / Pause Button */}
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-xl bg-[#E34060] hover:bg-[#cf3452] active:scale-95 text-white flex items-center justify-center shadow-sm shrink-0 transition-all cursor-pointer"
          title={isPlaying ? 'Pause preview' : 'Play acoustic preview'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>

      {/* Audio Wave Visualizer Simulation */}
      <div className="flex items-center gap-1 h-5 my-3 px-1">
        {[20, 60, 45, 90, 75, 40, 85, 30, 95, 65, 40, 70, 85, 50, 60, 30, 80, 45].map(
          (height, idx) => (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-all duration-200 ${
                isPlaying ? 'bg-[#23A2B3]' : 'bg-white/20'
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, Math.round(height * Math.random() + 20))}%` : '20%',
              }}
            />
          )
        )}
      </div>

      {/* Track Selector List */}
      <div className="space-y-1.5 pt-1">
        {SAMPLE_TRACKS.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => handleSelectTrack(idx)}
            className={`w-full p-2 rounded-lg text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
              idx === currentTrackIndex
                ? 'bg-white/15 text-white font-bold border border-white/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="truncate pr-2">{t.title}</span>
            <span className="text-[10px] text-neutral-400 font-mono">{t.duration}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
