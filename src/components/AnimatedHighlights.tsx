import React, { useState } from "react";
import { BlogPost, MusicEvent } from "../data/blogs.ts";
import { Sparkles, Calendar, MapPin, Clock, ChevronRight, Pause, Play, Music2, Heart } from "lucide-react";
import { AudioDemoPlayer } from "./AudioDemoPlayer.tsx";

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

  return (
    <aside className="w-full space-y-6">
      {/* 1. MOVING ANIMATED BLOG HIGHLIGHTS SECTION */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 relative overflow-hidden">
        {/* Header with Pause/Resume Control */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Iktaraa's Highlights
              </h3>
              <p className="text-xs text-slate-400">Handpicked Masterclasses</p>
            </div>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            title={isPaused ? "Resume vertical scrolling" : "Pause scrolling animation"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-slate-700" /> : <Pause className="w-3.5 h-3.5 fill-slate-700" />}
            <span>{isPaused ? "Play" : "Pause"}</span>
          </button>
        </div>

        {/* Moving Animated Highlights Container */}
        <div className="relative h-[380px] overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/50 to-white border border-slate-100/80 p-1">
          <div
            className={`space-y-3.5 transition-all duration-700 ${
              isPaused ? "" : "animate-marquee-vertical"
            }`}
          >
            {/* Duplicated list so the marquee loops seamlessly */}
            {[...highlightPosts, ...highlightPosts].map((post, idx) => (
              <div
                key={`${post.id}-${idx}`}
                onClick={() => onSelectPost(post)}
                className="group p-4 rounded-2xl bg-white hover:bg-teal-50/40 border border-slate-200/70 hover:border-teal-300 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#189BA3] border border-teal-100">
                        {post.highlightBadge || post.category}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {post.readTime}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 leading-snug line-clamp-2 transition-colors">
                      {post.title}
                    </h4>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-xs text-slate-500">
                      <span className="font-semibold text-rose-600 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>{post.likes} loves</span>
                      </span>
                      <span className="font-bold text-teal-700 flex items-center group-hover:translate-x-0.5 transition-transform">
                        Read Story <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fade masks for marquee transition */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent z-10" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10" />
        </div>
      </div>

      {/* Interactive Sound Demo Preview Widget */}
      {/* <AudioDemoPlayer compact={true} /> */}

      {/* 2. UPCOMING LIVE MUSIC EVENTS WIDGET */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Live Music Shows</h3>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
            City Tours
          </span>
        </div>

        <div className="space-y-3">
          {upcomingEvents.slice(0, 3).map((event) => (
            // <div
            //   key={event.id}
            //   onClick={() => onEventClick && onEventClick(event)}
            //   className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/90 border border-slate-100 transition-all cursor-pointer group"
            // >
            <div
              key={event.id}
              onClick={() => onEventClick && onEventClick(event)}
              className="p-3.5 rounded-2xl bg-#e34060 hover:bg-slate-100/90 border border-slate-100 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {event.city} • {event.genre}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{event.price}</span>
              </div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-teal-700 line-clamp-1 transition-colors">
                {event.title}
              </h5>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{event.location.split(",")[0]}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
