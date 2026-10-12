import React, { useState } from "react";
import { BlogPost } from "../data/blogs.ts";
import { Calendar, Clock, Heart, ArrowRight, Bookmark, MessageSquare } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
  onSelect: (post: BlogPost) => void;
  onLikeToggle?: (postId: string, newLikedState: boolean) => void;
  onBookmarkToggle?: (postId: string) => void;
  isBookmarked?: boolean;
  isLiked?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  post,
  onSelect,
  onLikeToggle,
  onBookmarkToggle,
  isBookmarked = false,
  isLiked = false,
}) => {
  const [likesCount, setLikesCount] = useState(post.likes);
  const [liked, setLiked] = useState(isLiked);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !liked;
    setLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : prev - 1));
    if (onLikeToggle) {
      onLikeToggle(post.id, nextState);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmarkToggle) {
      onBookmarkToggle(post.id);
    }
  };

  return (
    <article
      onClick={() => onSelect(post)}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
    >
      {/* Card Header & Image */}
      <div>
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={post.image}
            alt={post.imageAlt}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-transparent to-transparent opacity-85" />

          {/* Category Pill Top Left */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-md bg-white/95 backdrop-blur-md text-teal-800 border border-teal-100">
              {post.category}
            </span>
          </div>

          {/* Bookmark & Read Time Top Right */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-300" />
              {post.readTime}
            </span>

            <button
              onClick={handleBookmarkClick}
              aria-label="Bookmark article"
              className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                isBookmarked
                  ? "bg-amber-500 text-white"
                  : "bg-slate-900/70 text-white hover:bg-slate-900"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-white" : ""}`} />
            </button>
          </div>

          {/* Date Stamp on Bottom of Image */}
          <div className="absolute bottom-3.5 left-4 right-4 z-10 flex items-center justify-between text-white text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 font-medium drop-shadow-xs">
              <Calendar className="w-4 h-4 text-rose-300" />
              {post.date}
            </span>
            {post.isHighlight && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white text-xs font-bold shadow-xs">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-3.5">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Article Title */}
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-teal-700 leading-snug transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt Description */}
          <p className="text-sm sm:text-base text-slate-600 line-clamp-3 leading-relaxed font-normal">
            {post.shortDescription}
          </p>
        </div>
      </div>

      {/* Footer Info: ONLY Likes, Comments Count and Read link (Clear and properly sized) */}
      <div className="px-6 sm:px-7 pb-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3 text-sm text-slate-500">
        {/* Left: Likes & Comments count */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              liked
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/60"
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${
                liked ? "fill-rose-600 text-rose-600" : ""
              }`}
            />
            <span className="font-bold">{likesCount}</span>
          </button>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 text-xs sm:text-sm border border-slate-200/60"
            title="Comments discussion"
          >
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span className="font-bold">{post.commentsCount || 12}</span>
          </div>
        </div>

        {/* Right: Read Article Link */}
        <span className="inline-flex items-center gap-1.5 text-teal-700 font-bold group-hover:translate-x-1 transition-transform text-sm sm:text-base">
          Read <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </article>
  );
};
