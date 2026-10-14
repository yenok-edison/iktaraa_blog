import React, { useState, useMemo } from "react";
import { BlogPost, BlogCategory, MusicEvent } from "../data/blogs.ts";
import { AnimatedHighlights } from "./AnimatedHighlights.tsx";
import { BlogCard } from "./BlogCard.tsx";
import { BlogFilters, SortOption, DateFilterOption } from "./BlogFilters.tsx";
import { SlidersHorizontal, Search, Sparkles, X, Music2 } from "lucide-react";

interface BlogListViewProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  upcomingEvents: MusicEvent[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectPost: (post: BlogPost) => void;
  searchTerm: string;
  onClearSearch: () => void;
  bookmarkedIds: string[];
  likedIds: string[];
  onToggleBookmark: (id: string) => void;
  onToggleLike: (id: string, liked: boolean) => void;
  onSubscribe: (email: string) => void;
  onEventClick: (event: MusicEvent) => void;
}

export const BlogListView: React.FC<BlogListViewProps> = ({
  posts,
  categories,
  upcomingEvents,
  selectedCategory,
  onSelectCategory,
  onSelectPost,
  searchTerm,
  onClearSearch,
  bookmarkedIds,
  likedIds,
  onToggleBookmark,
  onToggleLike,
  onSubscribe,
  onEventClick,
}) => {
  // Sort and filter states
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileHighlightsOpen, setMobileHighlightsOpen] = useState(false);

  // Extract all unique tags
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 10);
  }, [posts]);

  // Filtered & sorted posts computation
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Category filter
        if (selectedCategory !== "all") {
          const catObj = categories.find((c) => c.id === selectedCategory);
          if (catObj && post.category !== catObj.name) {
            return false;
          }
        }

        // Search term filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = post.title.toLowerCase().includes(q);
          const matchDesc = post.shortDescription.toLowerCase().includes(q);
          const matchTags = post.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTags) return false;
        }

        // Tag filter
        if (selectedTag && !post.tags.includes(selectedTag)) {
          return false;
        }

        // Date filter
        if (dateFilter === "past_week") {
          const postDate = new Date(post.isoDate).getTime();
          const sevenDaysAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
          if (postDate < sevenDaysAgo) return false;
        } else if (dateFilter === "past_month") {
          const postDate = new Date(post.isoDate).getTime();
          const thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
          if (postDate < thirtyDaysAgo) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime();
        }
        if (sortBy === "most_likes") {
          return b.likes - a.likes;
        }
        if (sortBy === "most_views") {
          return b.views - a.views;
        }
        if (sortBy === "quick_reads") {
          const aMin = parseInt(a.readTime) || 5;
          const bMin = parseInt(b.readTime) || 5;
          return aMin - bMin;
        }
        if (sortBy === "deep_dives") {
          const aMin = parseInt(a.readTime) || 5;
          const bMin = parseInt(b.readTime) || 5;
          return bMin - aMin;
        }
        return 0;
      });
  }, [posts, selectedCategory, searchTerm, selectedTag, dateFilter, sortBy, categories]);

  // Highlights list
  const highlightPosts = useMemo(() => {
    return posts.filter((p) => p.isHighlight || p.isTrending);
  }, [posts]);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    sortBy !== "newest" ||
    dateFilter !== "all" ||
    selectedTag !== null ||
    searchTerm.trim() !== "";

  const handleResetFilters = () => {
    onSelectCategory("all");
    setSortBy("newest");
    setDateFilter("all");
    setSelectedTag(null);
    onClearSearch();
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];

  return (
    <section className="pt-4 sm:pt-6 pb-16 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* SECTION HEADER: Matches exact pastel background, font, and #e34060 color */}
      <div className="mb-8 sm:mb-10 text-center space-y-4 bg-gradient-to-r from-[#F2F7E9] via-[#FAF7ED] to-[#FDF1F3] border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-2xs">
        <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-[#23a2b3] tracking-tight leading-tight">
          Explore Music Knowledge & Masterclasses
        </h1>

        <p className="text-[15px] sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Inspire music learners across the globe with your skills. Verified instrument teardowns, maestro raga tutorials, and concert guides —{" "}
          <span className="text-[#e34060] font-semibold hover:underline cursor-pointer">
            Become a contributor
          </span>
        </p>

        {/* Category Pill Buttons */}
        <div className="flex items-center justify-center flex-wrap gap-2.5 pt-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                  isSelected
                    ? "bg-[#e34060] text-white shadow-sm shadow-[#e34060]/25 scale-105"
                    : "bg-white text-slate-700 hover:text-[#e34060] hover:border-[#e34060]/40 border border-slate-200/90"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active search notification banner if search query is active */}
        {searchTerm && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-rose-200 text-slate-800 text-sm font-semibold animate-in fade-in mt-1 shadow-2xs">
            <Search className="w-4 h-4 text-[#e34060]" />
            <span>
              Searching for: <span className="underline font-bold text-[#e34060]">"{searchTerm}"</span>
            </span>
            <button
              onClick={onClearSearch}
              className="p-1 rounded-full hover:bg-rose-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* MOBILE TOGGLE BUTTONS FOR FILTERS & HIGHLIGHTS */}
      <div className="lg:hidden flex items-center justify-between gap-3 mb-6">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex-1 py-3 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-teal-600" />
          <span>{mobileFilterOpen ? "Close Filters" : "Filters & Sort"}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => setMobileHighlightsOpen(!mobileHighlightsOpen)}
          className="flex-1 py-3 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>{mobileHighlightsOpen ? "Hide Highlights" : "View Highlights"}</span>
        </button>
      </div>

      {/* Mobile Drawer: Filters */}
      {mobileFilterOpen && (
        <div className="lg:hidden mb-6 animate-in slide-in-from-top-2">
          <BlogFilters
            sortBy={sortBy}
            onSortChange={setSortBy}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
            availableTags={availableTags}
            totalResultsCount={filteredPosts.length}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            onSubscribe={onSubscribe}
          />
        </div>
      )}

      {/* Mobile Drawer: Highlights */}
      {mobileHighlightsOpen && (
        <div className="lg:hidden mb-6 animate-in slide-in-from-top-2">
          <AnimatedHighlights
            highlightPosts={highlightPosts}
            upcomingEvents={upcomingEvents}
            onSelectPost={onSelectPost}
            onEventClick={onEventClick}
          />
        </div>
      )}

      {/* 3-COLUMN RESPONSIVE LAYOUT (Left: Filters, Center: Blogs, Right: Highlights) */}
      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
        {/* LEFT COLUMN: FILTERS & SORT */}
        <div className="hidden lg:block w-[220px] xl:w-[250px] shrink-0 sticky top-24">
          <BlogFilters
            sortBy={sortBy}
            onSortChange={setSortBy}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
            availableTags={availableTags}
            totalResultsCount={filteredPosts.length}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            onSubscribe={onSubscribe}
          />  
        </div>

        {/* MIDDLE COLUMN: BLOG BOXES (MAX EXPANSIVE CENTER VIEW) */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Status Header for Middle Stream */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {selectedCategoryObj.name}
              </h3>
              <span className="text-xs sm:text-sm px-3 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                {filteredPosts.length} {filteredPosts.length === 1 ? "story" : "stories"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
              <span>Sorted by:</span>
              <span className="font-bold text-slate-800 capitalize">
                {sortBy.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Blog Cards Feed - Wide, cinema-style 2-column cards */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onSelect={onSelectPost}
                  onLikeToggle={onToggleLike}
                  onBookmarkToggle={onToggleBookmark}
                  isBookmarked={bookmarkedIds.includes(post.id)}
                  isLiked={likedIds.includes(post.id)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-2xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#189BA3] flex items-center justify-center mx-auto shadow-2xs">
                <Music2 className="w-8 h-8 text-[#189BA3]" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">
                No stories match your filters
              </h4>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Try adjusting your search keywords, clearing selected topic tags, or browsing "All Categories".
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 rounded-full bg-[#189BA3] hover:bg-[#147e85] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: BLOG HIGHLIGHTS */}
        <div className="hidden lg:block w-[320px] xl:w-[350px] shrink-0 sticky top-24">
          <AnimatedHighlights
            highlightPosts={highlightPosts}
            upcomingEvents={upcomingEvents}
            onSelectPost={onSelectPost}
            onEventClick={onEventClick}
          />
        </div>
      </div>
    </section>
  );
};
