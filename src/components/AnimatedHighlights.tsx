
import React, { useEffect, useState } from "react";
import { BlogPost, MusicEvent } from "../data/blogs.ts";
import {
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  Heart,
  ArrowUpRight,
} from "lucide-react";

interface AnimatedHighlightsProps {
  highlightPosts: BlogPost[];
  upcomingEvents: MusicEvent[];
  onSelectPost: (post: BlogPost) => void;
  onEventClick?: (event: MusicEvent) => void;
}

export const AnimatedHighlights: React.FC<AnimatedHighlightsProps> = ({
  highlightPosts,
  upcomingEvents,
  onSelectPost,
  onEventClick,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalPosts = highlightPosts.length;
  const currentPost = highlightPosts[currentIndex];

  // Automatically advance one post at a time.
  useEffect(() => {
    if (isPaused || totalPosts <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % totalPosts);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused, totalPosts]);

  // Keep the selected slide valid if posts change.
  useEffect(() => {
    setCurrentIndex((index) =>
      totalPosts > 0 ? index % totalPosts : 0
    );
  }, [totalPosts]);

  const showPrevious = () => {
    setCurrentIndex((index) =>
      totalPosts > 0 ? (index - 1 + totalPosts) % totalPosts : 0
    );
  };

  const showNext = () => {
    setCurrentIndex((index) =>
      totalPosts > 0 ? (index + 1) % totalPosts : 0
    );
  };

  return (
    <aside className="w-full space-y-6">
      {/* 1. SINGLE-SLIDE EDITORIAL HIGHLIGHTS */}
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-teal-100/60 blur-3xl" />

        {/* Header */}
        <div className="relative mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e34060] text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                Iktaraa's Highlights
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Stories that inspire musicians
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPaused((paused) => !paused)}
            disabled={totalPosts <= 1}
            aria-label={isPaused ? "Resume slideshow" : "Pause slideshow"}
            title={isPaused ? "Resume slideshow" : "Pause slideshow"}
            className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50"
          >
            {isPaused ? (
              <Play className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Pause className="h-3.5 w-3.5 fill-current" />
            )}
            <span>{isPaused ? "Play" : "Pause"}</span>
          </button>
        </div>

        {/* Accent line */}
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/3 rounded-full bg-[#e34060]" />
        </div>

        {/* Only ONE post is rendered at a time */}
        {currentPost ? (
          <article
            key={currentPost.id}
            className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-[#FBFBFC] animate-in fade-in slide-in-from-right-3 duration-500"
          >
            {/* Featured image */}
            <button
              type="button"
              onClick={() => onSelectPost(currentPost)}
              aria-label={`Read ${currentPost.title}`}
              className="relative block h-48 w-full overflow-hidden bg-slate-200 text-left sm:h-56"
            >
              <img
                src={currentPost.image}
                alt={currentPost.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent" />

              {/* Image caption */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </button>

            {/* Post information */}
            <div className="p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1 w-6 rounded-full bg-[#e34060]" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
                  Music • Creativity • Inspiration
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectPost(currentPost)}
                className="block w-full text-left"
              >
                <h4 className="line-clamp-2 text-lg font-extrabold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-teal-700 sm:text-xl">
                  {currentPost.title}
                </h4>
              </button>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#e34060]">
                  <Heart className="h-4 w-4 fill-[#e34060]" />
                  {currentPost.likes} loves
                </span>

                <button
                  type="button"
                  onClick={() => onSelectPost(currentPost)}
                  className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-teal-700 active:scale-95"
                >
                  Read Story
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-slate-50 text-center">
            <Sparkles className="mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">
              Fresh stories coming soon
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Check back for our latest music highlights.
            </p>
          </div>
        )}

        {/* Carousel controls */}
        {totalPosts > 1 && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-sm font-extrabold tabular-nums text-slate-900">
                {String(currentIndex + 1).padStart(2, "0")}
              </span>

              <span className="text-xs text-slate-400">/</span>

              <span className="text-xs font-semibold tabular-nums text-slate-400">
                {String(totalPosts).padStart(2, "0")}
              </span>

              <div className="ml-1 flex items-center gap-1">
                {highlightPosts.map((post, index) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Show highlight ${index + 1}`}
                    aria-current={index === currentIndex ? "true" : undefined}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-6 bg-[#e34060]"
                        : "w-1.5 bg-slate-300 hover:bg-teal-400"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Previous highlight"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={showNext}
                aria-label="Next highlight"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e34060] text-white shadow-sm transition hover:bg-[#c92f4e] active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <p className="mt-3 text-center text-[10px] font-medium text-slate-400">
          {isPaused ? "Slideshow paused" : "Discover something new every 5 seconds"}
        </p>
      </section>

      {/* 2. UPCOMING LIVE MUSIC EVENTS */}
      <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <Calendar className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Live Music Shows
              </h3>
              <p className="text-xs text-slate-500">
                Find your next musical experience
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-[#fdfbe8] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-700">
            Upcoming
          </span>
        </div>

        <div className="space-y-3">
          {upcomingEvents.slice(0, 3).map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onEventClick?.(event)}
              className="group w-full rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-left transition-all duration-300 hover:border-teal-200 hover:bg-teal-50/60 hover:shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  {event.city} • {event.genre}
                </span>

                <span className="shrink-0 text-sm font-extrabold text-slate-900">
                  {event.price}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <h4 className="line-clamp-1 text-sm font-bold text-slate-800 transition-colors group-hover:text-teal-700">
                  {event.title}
                </h4>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-teal-700" />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-teal-600" />
                  {event.date}
                </span>

                <span className="flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#e34060]" />
                  <span className="truncate">
                    {event.location.split(",")[0]}
                  </span>
                </span>
              </div>
            </button>
          ))}

          {upcomingEvents.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
              New live music events will be announced soon.
            </p>
          )}
        </div>
      </section>
    </aside>
  );
};