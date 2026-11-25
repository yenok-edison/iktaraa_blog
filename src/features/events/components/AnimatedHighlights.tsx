import React, { useState, useEffect } from 'react';
import { Sparkles, Pause, Play, ArrowUpRight } from 'lucide-react';

interface AnimatedHighlightsProps {
  onSelectEvent?: (eventId: string) => void;
}

export const AnimatedHighlights: React.FC<AnimatedHighlightsProps> = ({ onSelectEvent }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const highlightStories = [
    {
      id: 'steinway-grand-masterclass',
      title: 'Vintage Steinway & Sons Model B Grand Piano: Acoustic Voicing',
      subtitle: 'Stories that inspire musicians',
      image: '/src/assets/images/vintage_grand_piano_1794209793753.jpg',
      category: 'Learn Page',
    },
    {
      id: 'kathaipomaa-10',
      title: 'Kathaipomaa? Edition 10 — Stories & Coffee',
      subtitle: 'Stories that inspire musicians',
      image: '/src/assets/images/colorful_story_amphitheater_1794046872666.jpg',
      category: 'Event',
    },
    {
      id: 'iktaraa-sunset-strings',
      title: 'Iktaraa Unplugged: Sitar, Sarod & Spanish Guitar',
      subtitle: 'Stories that inspire musicians',
      image: '/src/assets/images/colorful_live_concert_1794046871091.jpg',
      category: 'Event',
    },
  ];

  // Auto-advance progress when not paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlightStories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, highlightStories.length]);

  const activeStory = highlightStories[currentIndex];

  const handleClick = () => {
    if (onSelectEvent) {
      onSelectEvent(activeStory.id);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs p-5 space-y-4">
      
      {/* Header matching Screenshot: Red Icon Box + Iktaraa's Highlights + Pause Pill */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#de3d5c] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm text-[#231E59] tracking-tight">
              Iktaraa's Highlights
            </h3>
            <span className="text-xs text-neutral-400 font-medium block">
              Stories that inspire musicians
            </span>
          </div>
        </div>

        {/* Pause/Play Button Pill from Screenshot */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="border border-neutral-200/90 hover:bg-neutral-50 text-neutral-600 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
          title={isPaused ? 'Resume Highlights' : 'Pause Highlights'}
        >
          {isPaused ? (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Play</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3 fill-current" />
              <span>Pause</span>
            </>
          )}
        </button>
      </div>

      {/* Red Active Progress Bar from Screenshot */}
      <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="bg-[#de3d5c] h-full transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / highlightStories.length) * 100}%` }}
        />
      </div>

      {/* Highlight Story Preview Visual with Diagonal Arrow Button from Screenshot */}
      <div
        onClick={handleClick}
        className="rounded-2xl overflow-hidden relative aspect-[4/3] bg-neutral-900 group cursor-pointer shadow-2xs border border-neutral-100/80"
      >
        <img
          key={activeStory.id}
          src={activeStory.image}
          alt={activeStory.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Diagonal Arrow White Circle Button in Bottom-Left matching Screenshot */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="w-8 h-8 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-md hover:bg-neutral-100 transition-transform group-hover:scale-110">
            <ArrowUpRight className="w-4 h-4 text-neutral-800 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Story Title Caption below the clean image */}
      <div className="pt-1">
        <p className="text-xs font-bold text-[#231E59] font-heading line-clamp-2">
          {activeStory.title}
        </p>
      </div>

    </div>
  );
};
