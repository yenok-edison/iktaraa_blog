import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
} from 'lucide-react';
import { EventItem, HeroPromoCard } from '../types/event';
import { INITIAL_EVENTS } from '../data/events';

interface HeroSectionProps {
  events?: EventItem[];
  promos: HeroPromoCard[];
  onSelectEvent: (eventId: string) => void;
  onSelectCategoryTab: (cat: string) => void;
}

const AUTOPLAY_MS = 4500;

/**
 * Optional fixed background photo (e.g. a crowd / stage / instrument shot from
 * your own library, like '/images/iktaraa-hero-bg.jpg').
 * Leave empty to use the active event's cover image as a soft, cross-fading
 * background instead.
 */
const HERO_BG_IMAGE = '/images/ikt-events.jpg';

/** How visible the background photo is (0 – 1). Lower = more subtle. */
const HERO_BG_OPACITY = 0.32;

export const HeroSection: React.FC<HeroSectionProps> = ({
  events,
  onSelectEvent,
  onSelectCategoryTab,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const eventSlides = events && events.length > 0 ? events : INITIAL_EVENTS;
  const totalSlides = eventSlides.length;

  const goTo = (index: number) => {
    if (totalSlides === 0) return;
    setActiveIndex(((index % totalSlides) + totalSlides) % totalSlides);
  };
  const goNext = () => goTo(activeIndex + 1);
  const goPrev = () => goTo(activeIndex - 1);

  // Auto-play
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides, activeIndex]);

  // Keep active slide valid when events change
  useEffect(() => {
    setActiveIndex((prev) => (totalSlides > 0 ? prev % totalSlides : 0));
  }, [totalSlides]);

  // 3D carousel positions
  const visibleSlides = eventSlides
    .map((event, index) => {
      let position = index - activeIndex;

      if (position > totalSlides / 2) position -= totalSlides;
      if (position < -totalSlides / 2) position += totalSlides;

      return { event, index, position };
    })
    .filter(({ position }) => Math.abs(position) <= 2);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section
      className="relative overflow-hidden text-white py-6 sm:py-8 lg:py-10"
      style={{
        background: `
          linear-gradient(145deg, #172D49 0%, #251B43 48%, #10172F 100%)
        `,
      }}
    >
      <style>{`
        @keyframes heroProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes heroBgDrift { from { transform: scale(1.08) translate3d(0,0,0); } to { transform: scale(1.16) translate3d(-1.5%, -1%, 0); } }
        @keyframes heroInfoIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .hero-bg-img { animation: heroBgDrift 24s ease-in-out infinite alternate; }
        .hero-info-in { animation: heroInfoIn 500ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-card { transition: none !important; }
          .hero-progress { animation: none !important; }
          .hero-bg-img { animation: none !important; }
          .hero-info-in { animation: none !important; }
        }
      `}</style>

      {/* ───── Background photo layer ───── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {HERO_BG_IMAGE ? (
          <img
            src={HERO_BG_IMAGE}
            alt=""
            className="hero-bg-img absolute inset-0 w-full h-full object-cover"
            style={{ opacity: HERO_BG_OPACITY }}
          />
        ) : (
          visibleSlides
            .filter(({ position }) => Math.abs(position) <= 1)
            .map(({ event, position }) => {
              const src = event.coverImage || event.image;
              if (!src) return null;

              return (
                <img
                  key={event.id}
                  src={src}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="hero-bg-img absolute inset-0 w-full h-full object-cover blur-[3px] transition-opacity duration-[1400ms] ease-in-out"
                  style={{ opacity: position === 0 ? HERO_BG_OPACITY : 0 }}
                />
              );
            })
        )}

        {/* Tint + legibility overlays */}
        <div className="absolute inset-0 bg-[#10172F]/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#10172F]/80 via-[#251B43]/25 to-[#10172F]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_30%,rgba(16,23,47,0.65)_100%)]" />

        {/* Soft colour glows */}
        <div className="absolute -top-24 left-1/4 w-72 h-72 rounded-full bg-[#E34060]/15 blur-[110px]" />
        <div className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full bg-[#23A2B3]/15 blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-6 max-w-3xl text-center sm:mb-7 lg:mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#78DED5]/25 bg-white/[0.07] px-3.5 py-1.5 shadow-lg shadow-black/10 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#78DED5] shadow-[0_0_10px_rgba(120,222,213,0.8)]" />
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#A5EEE5] sm:text-[10px] sm:tracking-[0.3em]">
              Discover · Experience · Connect
            </p>
          </div>

          <h1 className="whitespace-nowrap text-3xl font-black uppercase leading-tight tracking-[-0.04em] text-white drop-shadow-[0_5px_25px_rgba(0,0,0,0.3)] sm:text-4xl lg:text-5xl">
            IKTARAA
            <span className="ml-2 inline bg-gradient-to-r from-[#E9DCEB] via-white to-[#A5EEE5] bg-clip-text font-light tracking-[0.04em] text-transparent sm:ml-3">
              EVENTS
            </span>
          </h1>

          <div className="mx-auto mt-3 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#E34060]" />
            <span className="h-1 w-7 rounded-full bg-[#E34060] shadow-[0_0_12px_rgba(227,64,96,0.55)]" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#E34060]" />
          </div>

          <p className="mx-auto mt-3 max-w-lg px-4 text-xs leading-6 text-white/75 sm:text-sm">
            Discover extraordinary musical experiences, creative gatherings and
            inspiring events. Find your next unforgettable experience with Iktaraa.
          </p>
        </div>

        {/* 3D Glass Carousel */}
        <div
          className="relative mx-auto max-w-5xl outline-none"
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured events"
          tabIndex={0}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
          }}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(delta) > 40) {
              delta < 0 ? goNext() : goPrev();
            }
          }}
          style={{ perspective: '1200px' }}
        >
          <div className="relative h-[220px] sm:h-[265px] lg:h-[290px]">
            {visibleSlides.map(({ event, index, position }) => {
              const distance = Math.abs(position);
              const isActive = position === 0;

              const scale = distance === 0 ? 1 : distance === 1 ? 0.85 : 0.7;
              const opacity = distance === 0 ? 1 : distance === 1 ? 0.8 : 0.4;
              const angle = position * -19;

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() =>
                    isActive ? onSelectEvent(event.id) : goTo(index)
                  }
                  aria-label={
                    isActive ? `View ${event.title}` : `Show ${event.title}`
                  }
                  aria-current={isActive ? 'true' : undefined}
                  className="hero-card group absolute top-1/2 left-1/2 w-[78%] sm:w-[52%] lg:w-[38%] max-w-[400px] aspect-[16/10] rounded-2xl overflow-hidden text-left cursor-pointer transition-all duration-700 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D6CB] focus-visible:ring-offset-4 focus-visible:ring-offset-[#172D49]"
                  style={{
                    transform: `translate(-50%, -50%) translateX(${
                      position * 76
                    }%) rotateY(${angle}deg) scale(${scale})`,
                    opacity,
                    zIndex: 20 - distance,
                    transformStyle: 'preserve-3d',
                    filter: isActive ? 'none' : 'saturate(0.75) brightness(0.85)',
                    border: isActive
                      ? '1px solid rgba(255,255,255,0.7)'
                      : '1px solid rgba(255,255,255,0.22)',
                    boxShadow: isActive
                      ? '0 24px 55px rgba(0,0,0,0.45), 0 0 36px rgba(227,64,96,0.22), 0 0 50px rgba(84,214,203,0.14)'
                      : '0 12px 32px rgba(0,0,0,0.35)',
                  }}
                >
                  {/* Image */}
                  {event.coverImage || event.image ? (
                    <img
                      src={event.coverImage || event.image}
                      alt={event.title}
                      loading={distance <= 1 ? 'eager' : 'lazy'}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8B286B] via-[#302A63] to-[#17A7A6]" />
                  )}

                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D20]/95 via-[#0E1026]/40 to-[#0E1026]/10" />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/15 via-transparent to-transparent" />

                  {/* Top row: counter (left) + category (right) */}
                  {isActive && (
                    <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between gap-2">
                      {totalSlides > 1 ? (
                        <span className="px-2 h-5 inline-flex items-center rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[9px] font-bold tracking-widest text-white/90 tabular-nums">
                          {pad(index + 1)} / {pad(totalSlides)}
                        </span>
                      ) : (
                        <span />
                      )}
                      {event.category && (
                        <span className="px-2.5 h-5 inline-flex items-center rounded-full bg-[#54D6CB] text-[#0E1026] text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">
                          {event.category}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom content */}
                  <div
                    key={isActive ? `active-${event.id}` : `idle-${event.id}`}
                    className={`absolute inset-x-0 bottom-0 p-3 sm:p-4 ${
                      isActive ? 'hero-info-in' : ''
                    }`}
                  >
                    <h2 className="text-white text-base sm:text-xl font-extrabold leading-tight tracking-tight line-clamp-1 sm:line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      {event.title}
                    </h2>

                    {isActive && (
                      <div className="mt-2.5 pt-2.5 border-t border-white/20 flex items-center justify-between gap-3">
                        {/* Meta */}
                        <div className="min-w-0 flex flex-col gap-1 text-[11px] sm:text-xs text-white/85">
                          {event.date && (
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <Calendar className="w-3.5 h-3.5 shrink-0 text-[#78DED5]" />
                              <span className="truncate">
                                {event.date}
                                {event.time ? ` · ${event.time}` : ''}
                              </span>
                            </span>
                          )}
                          {event.venue && (
                            <span className="hidden sm:inline-flex items-center gap-1.5 min-w-0">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#78DED5]" />
                              <span className="truncate">
                                {event.venue}
                                {event.city ? `, ${event.city}` : ''}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        <span className="shrink-0 inline-flex items-center gap-1.5 h-8 pl-3.5 pr-3 rounded-full bg-[#E34060] group-hover:bg-[#f0506f] text-white text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase shadow-[0_6px_18px_rgba(227,64,96,0.45)] transition-colors">
                          Explore
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Controls */}
          {totalSlides > 1 && (
            <div className="relative z-30 mt-3 sm:mt-4 flex flex-col items-center gap-2.5">
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous event"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-[#E34060] border border-white/20 backdrop-blur-md text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 max-w-[60vw] flex-wrap">
                  {eventSlides.map((event, index) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={`Go to event ${index + 1}`}
                      aria-current={activeIndex === index ? 'true' : undefined}
                      className={`rounded-full transition-all duration-300 cursor-pointer ${
                        activeIndex === index
                          ? 'w-6 h-2 bg-[#E34060] shadow-[0_0_14px_rgba(227,64,96,0.7)]'
                          : 'w-2 h-2 bg-white/35 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next event"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-[#E34060] border border-white/20 backdrop-blur-md text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Autoplay progress */}
              <div className="h-0.5 w-24 rounded-full bg-white/15 overflow-hidden">
                <div
                  key={activeIndex}
                  className="hero-progress h-full w-full origin-left rounded-full bg-[#54D6CB]"
                  style={{
                    animation: `heroProgress ${AUTOPLAY_MS}ms linear forwards`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                  }}
                />
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Bottom edge line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </section>
  );
};