import React, { useState, useEffect } from "react";
import { BlogPost, MusicEvent, SOCIAL_MEDIA_LINKS, CONTACT_DETAILS } from "../data/blogs.ts";
import { BlogCard } from "./BlogCard.tsx";
import { AudioDemoPlayer } from "./AudioDemoPlayer.tsx";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Heart,
  Share2,
  Bookmark,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  MapPin,
  Flame,
  Phone,
  Mail,
  Send,
  User,
  Quote,
  Lightbulb,
  CheckCircle2,
  Instagram,
  Youtube,
  Music,
  Twitter,
  MessageCircle,
} from "lucide-react";

import {
  siInstagram,
  siYoutube,
  siSpotify,
  siWhatsapp,
} from "simple-icons";

interface Comment {
  id: string;
  author: string;
  email: string;
  avatar: string;
  date: string;
  text: string;
  likes: number;
}

interface BlogDetailViewProps {
  post: BlogPost;
  allPosts: BlogPost[];
  upcomingEvents: MusicEvent[];
  onBack: () => void;
  onSelectRelatedPost: (post: BlogPost) => void;
  isBookmarked: boolean;
  isLiked: boolean;
  onToggleBookmark: (postId: string) => void;
  onToggleLike: (postId: string, liked: boolean) => void;
  onShowToast: (message: string, type?: "success" | "info") => void;
  onEventClick: (event: MusicEvent) => void;
  currentUser?: { name: string; email: string } | null;
  onPromptLogin?: () => void;
}

export const BlogDetailView: React.FC<BlogDetailViewProps> = ({
  post,
  allPosts,
  upcomingEvents,
  onBack,
  onSelectRelatedPost,
  isBookmarked,
  isLiked,
  onToggleBookmark,
  onToggleLike,
  onShowToast,
  onEventClick,
  currentUser,
  onPromptLogin,
}) => {
  const [likesCount, setLikesCount] = useState(post.likes);
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c-1",
      author: "Aditi Sharma",
      email: "aditi.sharma92@gmail.com",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      date: "2 days ago",
      text: "The breakdown between solid spruce and cedar tops answered all the doubts I had! Just visited an Iktaraa partner store in Bangalore to test both in person.",
      likes: 14,
    },
    {
      id: "c-2",
      author: "Neil Fernandes",
      email: "neil.fernandes.guitar@outlook.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      date: "1 day ago",
      text: "Setting the string action correctly made a night-and-day difference for my practice stamina. Great actionable pro-tips!",
      likes: 8,
    },
  ]);
  const [newCommentName, setNewCommentName] = useState(currentUser?.name || "");
  const [newCommentEmail, setNewCommentEmail] = useState(currentUser?.email || "");
  const [newCommentText, setNewCommentText] = useState("");

  // Sync comment fields when currentUser logs in
  useEffect(() => {
    if (currentUser) {
      setNewCommentName(currentUser.name);
      setNewCommentEmail(currentUser.email);
    }
  }, [currentUser]);

  // Newsletter in sidebar
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Contact quick message
  const [contactMessageSent, setContactMessageSent] = useState(false);

  // Sync likes and bookmarks if prop changes
  useEffect(() => {
    setLikesCount(post.likes);
    setLiked(isLiked);
    setBookmarked(isBookmarked);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [post.id, isLiked, isBookmarked]);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, current)));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Like
  const handleLikeClick = () => {
    const nextState = !liked;
    setLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : prev - 1));
    onToggleLike(post.id, nextState);
    if (nextState) {
      onShowToast("You loved this article! ❤️", "success");
    }
  };

  // Handle Bookmark
  const handleBookmarkClick = () => {
    const next = !bookmarked;
    setBookmarked(next);
    onToggleBookmark(post.id);
    onShowToast(next ? "Article saved to your reading list!" : "Article removed from bookmarks", "info");
  };

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    onShowToast("Article link copied to clipboard! 📋", "success");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Add comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const authorName = currentUser?.name || newCommentName.trim() || "Passionate Musician";
    const authorEmail = currentUser?.email || newCommentEmail.trim() || "community@iktaraa.com";

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: authorName,
      email: authorEmail,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      date: "Just now",
      text: newCommentText.trim(),
      likes: 1,
    };

    setComments([newComment, ...comments]);
    setNewCommentText("");
    if (!currentUser) {
      setNewCommentName("");
      setNewCommentEmail("");
    }
    onShowToast("Your comment has been posted! 🎵", "success");
  };

  // Newsletter submit
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
    onShowToast("Subscribed to The Iktaraa Dispatch! 📬", "success");
  };

  // Related posts
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && (post.relatedIds.includes(p.id) || p.category === post.category))
    .slice(0, 3);

  // Trending list
  const trendingPosts = allPosts.filter((p) => p.id !== post.id && p.isTrending).slice(0, 4);

  return (
    <article className="min-h-screen bg-[#FBFBFC] pb-24">
      {/* Sticky Reading Progress Bar at the top */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-200/50 z-50">
        <div
          className="h-full bg-gradient-to-r from-teal-500 via-[#DF3B57] to-amber-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Breadcrumb & Return Action Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-20 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all shadow-2xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to All Blogs</span>
          </button>

          {/* Breadcrumb path */}
          <nav className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
            <span className="hover:text-teal-700 cursor-pointer" onClick={onBack}>
              Iktaraa
            </span>
            <span>/</span>
            <span className="text-teal-700 font-bold">{post.category}</span>
            <span>/</span>
            <span className="text-slate-400 truncate max-w-xs">{post.title}</span>
          </nav>

          {/* Quick Share and Bookmark */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkClick}
              className={`p-2 rounded-full border transition-colors ${
                bookmarked
                  ? "bg-amber-50 text-amber-600 border-amber-300"
                  : "bg-white text-slate-600 hover:text-slate-900 border-slate-200"
              }`}
              title={bookmarked ? "Remove bookmark" : "Save article"}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-amber-600" : ""}`} />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
              title="Copy article link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN 3-COLUMN LAYOUT (Maximized reading space with compact secondary sidebars) */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="flex flex-col lg:flex-row gap-5 xl:gap-7 items-start">
          {/* ============================================================= */}
          {/* LEFT SIDEBAR: IMPORTANT EVENTS, TRENDING NOW, AUDIO DEMO     */}
          {/* ============================================================= */}
          <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0 space-y-6 order-2 lg:order-1">
            {/* LEFT SIDE: IMPORTANT EVENTS (Explicitly requested) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Important Events
                    </h3>
                    <p className="text-xs text-slate-400">Masterclasses & Live Shows</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Upcoming
                </span>
              </div>

              <div className="space-y-3.5">
                {upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => onEventClick(evt)}
                    className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/70 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-[#DF3B57] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                        {evt.badge}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{evt.price}</span>
                    </div>

                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
                      {evt.title}
                    </h5>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex flex-col gap-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.date} • {evt.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-semibold">
                        {evt.spotsLeft} spots available
                      </span>
                      <button
                        type="button"
                        className="text-[#DF3B57] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Register</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEFT SIDE: TRENDING NOW (Explicitly requested) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-3.5">
              <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Trending Now
                  </h3>
                  <p className="text-xs text-slate-400">Most discussed in community</p>
                </div>
              </div>

              <div className="space-y-3">
                {trendingPosts.map((trPost, idx) => (
                  <div
                    key={trPost.id}
                    onClick={() => onSelectRelatedPost(trPost)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group"
                  >
                    <span className="text-lg font-bold text-slate-300 group-hover:text-[#DF3B57] transition-colors w-5 shrink-0 pt-0.5">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#189BA3]">
                        {trPost.category}
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 line-clamp-2 leading-snug">
                        {trPost.title}
                      </h5>
                      <span className="text-xs text-slate-400 mt-1 block">
                        {trPost.readTime} • {trPost.likes} likes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio demo preview if present */}
            {post.audioSnippet && (
              <AudioDemoPlayer snippet={post.audioSnippet} compact={false} />
            )}
          </aside>

          {/* ============================================================= */}
          {/* CENTER: BLOG IMAGE, TOP-RIGHT DATE, TITLE, DESCRIPTION, BODY */}
          {/* ============================================================= */}
          <main className="flex-1 min-w-0 space-y-8 order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 space-y-6">
              {/* CENTER HERO IMAGE WITH TOP-RIGHT BLOG DATE (Explicitly requested) */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-md bg-slate-100">
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  className="w-full h-full object-cover"
                />

                {/* Top Left: Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-md bg-white/95 backdrop-blur-md text-teal-900 border border-teal-200">
                    {post.category}
                  </span>
                </div>

                {/* TOP RIGHT BLOG DATE (As requested: "start with in the center place the blog image top right blog date") */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold shadow-md border border-white/20">
                    <Calendar className="w-3.5 h-3.5 text-rose-300" />
                    <span>{post.date}</span>
                  </div>
                </div>

                {/* Photographer credit bottom right */}
                {post.imageCredit && (
                  <div className="absolute bottom-2 right-3 text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                    {post.imageCredit}
                  </div>
                )}
              </div>

              {/* ARTICLE META HEADER: TITLE, AUTHOR, STATS */}
              <div className="space-y-4 pt-2">
                {/* Topic tags */}
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-100"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Primary Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {post.title}
                </h1>

                {/* Author Info Bar - Iktaraa Editorial Team */}
                <div className="flex items-center justify-between flex-wrap gap-4 py-3.5 border-y border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-600 via-indigo-700 to-[#DF3B57] text-white flex items-center justify-center font-bold text-base shadow-xs ring-2 ring-teal-600/30">
                      ik
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">Iktaraa</h4>
                        <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]" title="Official Publication">
                          ✓
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">Certified Luthier & Research Team</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {post.readTime}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-teal-700">
                      {post.views.toLocaleString()} Reads
                    </span>
                  </div>
                </div>

                {/* Lead Excerpt Description */}
                <p className="text-lg sm:text-xl text-slate-700 font-medium leading-relaxed italic border-l-4 border-rose-500 pl-4 py-1.5 bg-rose-50/30 rounded-r-xl">
                  "{post.shortDescription}"
                </p>
              </div>

              {/* Key Highlights Callout */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50/80 via-emerald-50/50 to-white border border-teal-200/80 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Key Musical Takeaways</span>
                </h4>
                <ul className="space-y-2.5 text-sm sm:text-base text-slate-700">
                  {post.content.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rich Body Content */}
              <div className="space-y-6 text-slate-700 text-base sm:text-lg leading-relaxed">
                {/* Introduction */}
                <section id="introduction" className="space-y-3">
                  <p>{post.content.introduction}</p>
                </section>

                {/* Main Sections */}
                {post.content.sections.map((section, idx) => (
                  <section
                    key={idx}
                    id={`sec-${idx}`}
                    className="space-y-4 pt-6 border-t border-slate-100"
                  >
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {section.heading}
                    </h3>

                    <p className="leading-relaxed">{section.body}</p>

                    {/* Pro Tip Box */}
                    {section.proTip && (
                      <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5 text-sm sm:text-base text-amber-900">
                        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Luthier Pro-Tip: </span>
                          <span>{section.proTip}</span>
                        </div>
                      </div>
                    )}

                    {/* Blockquote */}
                    {section.quote && (
                      <blockquote className="my-5 p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
                        <Quote className="w-8 h-8 text-rose-500/30 absolute top-3 right-3" />
                        <p className="text-base sm:text-lg font-serif italic text-slate-100 relative z-10 leading-relaxed">
                          "{section.quote}"
                        </p>
                        {section.quoteAuthor && (
                          <cite className="block text-xs sm:text-sm text-rose-400 font-sans font-bold mt-2.5 not-italic">
                            — {section.quoteAuthor}
                          </cite>
                        )}
                      </blockquote>
                    )}

                    {/* Gear Specs Table */}
                    {section.specs && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 text-xs sm:text-sm">
                        <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-700">
                          Acoustic & Tonewood Specifications
                        </div>
                        <div className="divide-y divide-slate-100">
                          {section.specs.map((spec, sIdx) => (
                            <div
                              key={sIdx}
                              className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-white hover:bg-slate-50"
                            >
                              <span className="font-bold text-slate-800">{spec.label}</span>
                              <span className="text-slate-600">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                ))}

                {/* Conclusion */}
                <section
                  id="conclusion"
                  className="space-y-3 pt-6 border-t border-slate-100"
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    The Final Chord
                  </h3>
                  <p>{post.content.conclusion}</p>
                </section>
              </div>

              {/* INTERACTIVE LIKE, CLAP, BOOKMARK BAR */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLikeClick}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all transform active:scale-95 shadow-sm ${
                      liked
                        ? "bg-[#DF3B57] text-white shadow-rose-200"
                        : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? "fill-white" : ""}`} />
                    <span>{liked ? "Liked!" : "Love"}</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                      {likesCount}
                    </span>
                  </button>

                  <button
                    onClick={handleBookmarkClick}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-colors ${
                      bookmarked
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-amber-600" : ""}`} />
                    <span>{bookmarked ? "Saved" : "Save for later"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* COMMENTS SECTION */}
              <div className="pt-8 border-t border-slate-200/90 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#189BA3]">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        Community Discussion ({comments.length})
                      </h3>
                      <p className="text-xs text-slate-400">Musicians and gear enthusiasts sharing insights</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                    Active Forum
                  </span>
                </div>

                {/* Add Comment Form */}
                <form
                  onSubmit={handleAddComment}
                  className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5"
                >
                  {currentUser ? (
                    <div className="flex items-center justify-between bg-slate-50/80 px-4 py-3 rounded-2xl border border-teal-200/60 text-sm">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-slate-500 text-xs sm:text-sm">Signed in as:</span>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{currentUser.name}</span>
                        <span className="font-mono text-xs text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60 font-medium">
                          {currentUser.email}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">Verified</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Responsive Sign-In Banner / Guest Notification */}
                      {onPromptLogin && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs transition-all">
                          <div className="flex items-center gap-2.5 text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-[#189BA3] shrink-0" />
                            <span className="leading-relaxed">Commenting as a guest. Your name & email will be displayed.</span>
                          </div>
                          <button
                            type="button"
                            onClick={onPromptLogin}
                            className="inline-flex items-center gap-1.5 font-semibold text-[#189BA3] hover:text-[#0d6e74] transition-colors cursor-pointer self-start sm:self-auto text-xs shrink-0 py-0.5"
                          >
                            <span>Already have an account?</span>
                            <span className="font-bold underline decoration-[#189BA3] underline-offset-4">Sign in</span>
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={newCommentName}
                            onChange={(e) => setNewCommentName(e.target.value)}
                            placeholder="Your Full Name *"
                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#189BA3] focus:ring-4 focus:ring-teal-500/10 transition-all"
                          />
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={newCommentEmail}
                            onChange={(e) => setNewCommentEmail(e.target.value)}
                            placeholder="Your Email ID (e.g. name@example.com) *"
                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#189BA3] focus:ring-4 focus:ring-teal-500/10 transition-all"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <textarea
                      required
                      rows={4}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Share your musical experience, questions, gear thoughts, or feedback..."
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#189BA3] focus:ring-4 focus:ring-teal-500/10 resize-none transition-all leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                    <p className="text-xs text-slate-400 hidden sm:block">
                      Be respectful and supportive of fellow musicians.
                    </p>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#DF3B57] hover:bg-[#c92f4a] active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-rose-500/20 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4 pt-3">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-3 transition-all hover:border-slate-300/80"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatar}
                            alt={c.author}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-sm font-bold text-slate-900">{c.author}</h5>
                              {c.email && (
                                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/60 font-medium">
                                  {c.email}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">{c.date}</span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                          {c.likes}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-12">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* ============================================================= */}
          {/* RIGHT SIDEBAR: SOCIAL MEDIA ACCOUNTS, CONTACT US, NEWSLETTER */}
          {/* ============================================================= */}
          <aside className="w-full lg:w-[240px] xl:w-[260px] shrink-0 space-y-6 order-3">
            {/* RIGHT SIDE: SOCIAL MEDIA ACCOUNTS (Explicitly requested) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
              <div className="pb-3.5 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-teal-600" />
                  <span>Connect With Us</span>
                </h3>
                <p className="text-xs text-slate-400">Join our vibrant musical ecosystem</p>
              </div>

              <div className="space-y-2.5">
                {SOCIAL_MEDIA_LINKS.map((social) => {
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/70 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${social.color} text-white flex items-center justify-center shrink-0 shadow-2xs`}
                        >
                          {social.name === "Instagram" && <Instagram className="w-4 h-4" />}
                          {social.name === "YouTube" && <Youtube className="w-4 h-4" />}
                          {social.name === "Spotify" && <Music className="w-4 h-4" />}
                          {social.name.includes("Twitter") && <Twitter className="w-4 h-4" />}
                          {social.name.includes("WhatsApp") && <MessageCircle className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 truncate">
                            {social.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{social.followers}</p>
                        </div>
                      </div>

                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0" />
                    </a>
                  );
                })}
              </div>

              {/* Quick Share Buttons */}
              {/* <div className="pt-2.5 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Share this story
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div> */}
            </div>

            {/* RIGHT SIDE: CONTACT US (Explicitly requested) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
              <div className="pb-3.5 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#DF3B57]" />
                  <span>Contact Us & Support</span>
                </h3>
                <p className="text-xs text-slate-400">Personalized musical consultation</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {CONTACT_DETAILS.subtext}
              </p>

              <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <a
                  href={`tel:${CONTACT_DETAILS.phone.replace(/[^0-9]/g, "")}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/60 hover:bg-rose-100/60 text-rose-950 font-semibold transition-colors border border-rose-100"
                >
                  <Phone className="w-4 h-4 text-[#DF3B57] shrink-0" />
                  <span>{CONTACT_DETAILS.phone}</span>
                </a>

                <a
                  href={`mailto:${CONTACT_DETAILS.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-teal-50/60 hover:bg-teal-100/60 text-teal-950 font-semibold transition-colors border border-teal-100"
                >
                  <Mail className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>{CONTACT_DETAILS.email}</span>
                </a>

                <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 leading-relaxed border border-slate-100">
                  <span className="font-bold text-slate-800 block text-xs sm:text-sm mb-0.5">Iktaraa Studio:</span>
                  <span>{CONTACT_DETAILS.location}</span>
                </div>
              </div>

              {/* Quick message request */}
              {contactMessageSent ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Request received! A gear specialist will call you back.</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setContactMessageSent(true);
                    onShowToast("Consultation request received! We'll reach out shortly.", "success");
                  }}
                  className="w-full py-3 rounded-xl bg-[#DF3B57] hover:bg-[#c92f4a] active:scale-98 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
                >
                  Free Gear Consultation
                </button>
              )}
            </div>

            {/* RIGHT SIDE: NEWSLETTER (Explicitly requested) */}
            <div className="bg-gradient-to-br from-[#12312b] to-[#0a231e] text-white rounded-3xl p-5 sm:p-6 shadow-md border border-teal-800/80 space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <Mail className="w-4 h-4" />
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-white">The Iktaraa Dispatch</h4>
                <p className="text-xs sm:text-sm text-teal-200/90 mt-1 leading-relaxed">
                  Join 25,000+ guitarists, vocalists, and producers getting weekly masterclass drops.
                </p>
              </div>

              {newsletterSubscribed ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-xs sm:text-sm text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Subscribed! Check your inbox soon.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-2 pt-1">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-teal-950/80 border border-teal-700/60 text-xs sm:text-sm text-white placeholder-teal-300/40 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#DF3B57] hover:bg-[#c92f4a] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    Subscribe Weekly
                  </button>
                </form>
              )}
            </div>

            {/* Iktaraa Publishing Team Card in sidebar */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 via-indigo-700 to-[#DF3B57] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md ring-4 ring-rose-50">
                ik
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Iktaraa</h4>
                <p className="text-xs text-[#DF3B57] font-semibold">Official Musical Publication</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                All articles, buying guides, and masterclasses are researched, verified, and published directly by Iktaraa's acoustic engineers and verified musicians.
              </p>
            </div>
          </aside>
        </div>

        {/* ============================================================= */}
        {/* AT THE BOTTOM: SHOW THE RELATED BLOGS (Explicitly requested)  */}
        {/* ============================================================= */}
        <section className="mt-16 pt-12 border-t border-slate-200/90 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Continue Reading</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Related Blogs & Deep Dives
              </h3>
            </div>

            <button
              onClick={onBack}
              className="text-sm font-bold text-[#189BA3] hover:text-teal-900 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Explore all articles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((rPost) => (
              <BlogCard
                key={rPost.id}
                post={rPost}
                onSelect={onSelectRelatedPost}
                onLikeToggle={onToggleLike}
                onBookmarkToggle={onToggleBookmark}
                isBookmarked={false}
                isLiked={false}
              />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
};
