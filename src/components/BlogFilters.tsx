import React, { useState } from "react";
import {
  ArrowUpDown,
  Calendar,
  Tag,
  Filter,
  RotateCcw,
  Mail,
  CheckCircle2,
  Sparkles,
  Heart,
  TrendingUp,
  Zap,
  BookOpen,
  Clock,
  ArrowBigRight,
  ArrowRight
} from "lucide-react";

export type SortOption =
  | "newest"
  | "oldest"
  | "most_likes"
  | "most_views"
  | "quick_reads"
  | "deep_dives";

export type DateFilterOption = "all" | "past_week" | "past_month" | "year_2026";

interface BlogFiltersProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  dateFilter: DateFilterOption;
  onDateFilterChange: (date: DateFilterOption) => void;
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  availableTags: string[];
  totalResultsCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onSubscribe?: (email: string) => void;
}

export const BlogFilters: React.FC<BlogFiltersProps> = ({
  sortBy,
  onSortChange,
  dateFilter,
  onDateFilterChange,
  selectedTag,
  onTagChange,
  availableTags,
  totalResultsCount,
  onResetFilters,
  hasActiveFilters,
  onSubscribe,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;
    if (onSubscribe) onSubscribe(newsletterEmail);
    setSubscribed(true);
    setNewsletterEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  };

  const sortOptions = [
    { id: "newest", label: "Newest First", Icon: ArrowRight },
    { id: "most_likes", label: "Most Liked", Icon: ArrowRight },
    { id: "most_views", label: "Most Viewed", Icon: ArrowRight },
    // { id: "quick_reads", label: "Quick Reads (< 7 min)", Icon: ArrowRight },
    // { id: "deep_dives", label: "Deep Dives (≥ 8 min)", Icon: ArrowRight },
    { id: "oldest", label: "Oldest First", Icon: ArrowRight },
  ] as const;
  // const sortOptions = [
  //   { id: "newest", label: "Newest First", Icon: Sparkles },
  //   { id: "most_likes", label: "Most Liked", Icon: Heart },
  //   { id: "most_views", label: "Most Viewed", Icon: TrendingUp },
  //   { id: "quick_reads", label: "Quick Reads (< 7 min)", Icon: Zap },
  //   { id: "deep_dives", label: "Deep Dives (≥ 8 min)", Icon: BookOpen },
  //   { id: "oldest", label: "Oldest First", Icon: Clock },
  // ] as const;

  return (
    <aside className="w-full space-y-5">
      {/* Primary Filter Control Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-5">
        {/* Header with Active Filters Reset */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Filter className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Filter & Sort
              </h3>
              <p className="text-xs text-slate-400">
                {totalResultsCount} {totalResultsCount === 1 ? "story" : "stories"}
              </p>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs px-2.5 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-[#189BA3] font-bold flex items-center gap-1 transition-all cursor-pointer border border-teal-200/60"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* 1. Sort Options (Clean icons instead of color emojis) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#189BA3]" />
            <span>Sort Stories By</span>
          </label>

          <div className="grid grid-cols-1 gap-1.5">
            {sortOptions.map((option) => {
              const active = sortBy === option.id;
              const { Icon } = option;
              return (
                <button
                  key={option.id}
                  onClick={() => onSortChange(option.id as SortOption)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    active
                      ? "bg-[#e34060] text-white shadow-2xs font-bold"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        active
                          ? "text-white"
                          : option.id === "most_likes"
                          ? "text-rose-500"
                          : option.id === "most_views"
                          ? "text-[#189BA3]"
                          : option.id === "quick_reads"
                          ? "text-amber-500"
                          : option.id === "newest"
                          ? "text-[#189BA3]"
                          : "text-slate-400"
                      }`}
                    />
                    <span>{option.label}</span>
                  </span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Date Filter */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-[#189BA3]" />
            <span>Publish Date</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "all", label: "All Time" },
              { id: "past_week", label: "Past 7 Days" },
              { id: "past_month", label: "Past 30 Days" },
              { id: "year_2026", label: "Year 2026" },
            ].map((item) => {
              const active = dateFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onDateFilterChange(item.id as DateFilterOption)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                    active
                      ? "bg-[#e34060] text-white shadow-2xs font-bold"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Filter by Instrument & Topic Tags */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>Popular Topics</span>
          </label>

          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onTagChange(active ? null : tag)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white font-bold shadow-2xs scale-105"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* images/apple-touch-icon.png */}

      {/* Newsletter Subscription Box */}
      <div className="bg-gradient-to-br from-teal-900 via-[#0A4D45] to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-teal-800 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Mail className="w-4 h-4" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              The Iktaraa Dispatch
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
            Curated guitar tabs, raga charts & gear reviews in your inbox weekly.
          </p>

          {subscribed ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Subscribed! Welcome to the rhythm.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribeSubmit} className="space-y-2 pt-1">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-teal-950/70 border border-teal-700/60 text-xs sm:text-sm text-white placeholder-teal-300/50 focus:outline-none focus:ring-1 focus:ring-teal-400 transition-all"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#e34060] hover:bg-[#147e85] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                Join 25,000+ Musicians
              </button>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
};
