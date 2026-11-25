import React, { useState, useEffect, useRef } from "react";
// import { BlogPost, MusicEvent, SOCIAL_MEDIA_LINKS, CONTACT_DETAILS } from "../data/blogs.ts";
import {
  SOCIAL_MEDIA_LINKS,
  CONTACT_DETAILS,
} from "../../../shared/data/site.ts";

import type {
  BlogPost,
  MusicEvent,
} from "../data/blogs.ts";
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
    fetchPostComments,
    createPostComment,
    fetchReaderBookmarks,
    addReaderBookmark,
    removeReaderBookmark,
    incrementBlogPostView,
    fetchBlogPostLike,
    likeBlogPost,
    unlikeBlogPost,
    type ApiComment,
} from "../services/blogApi";

interface BlogComment {
    id: number;
    author: string;
    date: string;
    text: string;
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
  const [viewsCount, setViewsCount] = useState(post.views);
  const [liked, setLiked] = useState(isLiked);
  const [likeLoading, setLikeLoading] = useState(false);

  // Remember a Like click while the reader logs in.
  const pendingLike = useRef(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Comments state — loaded from Django
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Bookmark record ID from Django
  const [bookmarkRecordId, setBookmarkRecordId] = useState<number | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Format the API date for display
  const formatCommentDate = (date: string) => {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
          return "";
      }

      return parsedDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
      });
  };

  // Prevent duplicate view requests during React StrictMode.
  const countedPostSlug = useRef<string | null>(null);

  // Count a view whenever a different blog post is opened.
  useEffect(() => {
      setViewsCount(post.views);

      if (countedPostSlug.current === post.slug) {
          return;
      }

      countedPostSlug.current = post.slug;

      incrementBlogPostView(post.slug)
          .then((response) => {
              // Never let an older response overwrite a newer count.
              if (countedPostSlug.current === post.slug) {
                  setViewsCount((current) =>
                      Math.max(current, response.views)
                  );
              }
          })
          .catch((error) => {
              console.error("Failed to count blog view:", error);
          });

  }, [post.slug]);

  // Load approved comments whenever the displayed post changes
  useEffect(() => {
      let active = true;

      const loadComments = async () => {
          setCommentsLoading(true);

          try {
              const response = await fetchPostComments(post.slug);

              if (!active) return;

              setComments(
                  response.results.map((comment: ApiComment) => ({
                      id: comment.id,
                      author: comment.reader_name,
                      date: formatCommentDate(comment.created_at),
                      text: comment.content,
                  }))
              );
          } catch (error) {
              if (!active) return;

              console.error("Failed to load comments:", error);
              setComments([]);
          } finally {
              if (active) {
                  setCommentsLoading(false);
              }
          }
      };

      loadComments();

      return () => {
          active = false;
      };
  }, [post.slug]);

  // Load the signed-in reader's bookmarks
  useEffect(() => {
      let active = true;

      const loadBookmarks = async () => {
          if (!currentUser || post.apiId === undefined) {
              setBookmarkRecordId(null);
              setBookmarked(false);
              return;
          }

          try {
              const response = await fetchReaderBookmarks();

              if (!active) return;

              const existingBookmark = response.results.find(
                  (bookmark) => bookmark.post === post.apiId
              );

              setBookmarkRecordId(existingBookmark?.id ?? null);
              setBookmarked(Boolean(existingBookmark));
          } catch (error) {
              if (!active) return;

              console.error("Failed to load bookmarks:", error);
          }
      };

      loadBookmarks();

      return () => {
          active = false;
      };
  }, [currentUser, post.apiId]);
  // const [newCommentText, setNewCommentText] = useState("");

  // Load this reader's Like status from Django.
  useEffect(() => {
      let active = true;

      setLikesCount(post.likes);
      setLiked(false);

      if (!currentUser) {
          return () => {
              active = false;
          };
      }

      // If the reader clicked Love before logging in,
      // save that Like immediately after login.
      if (pendingLike.current) {
          pendingLike.current = false;
          setLikeLoading(true);

          likeBlogPost(post.slug)
              .then((response) => {
                  if (!active) return;

                  setLiked(response.liked);
                  setLikesCount(response.likes);
                  onToggleLike(post.id, response.liked);
                  onShowToast("You loved this article! ❤️", "success");
              })
              .catch((error) => {
                  if (!active) return;

                  console.error("Failed to save pending Like:", error);
                  onShowToast("Unable to save your Like. Please try again.", "info");
              })
              .finally(() => {
                  if (active) setLikeLoading(false);
              });

          return () => {
              active = false;
          };
      }

      // Otherwise, retrieve the existing Like status.
      fetchBlogPostLike(post.slug)
          .then((response) => {
              if (!active) return;

              setLiked(response.liked);
              setLikesCount(response.likes);
              onToggleLike(post.id, response.liked);
          })
          .catch((error) => {
              if (!active) return;

              console.error("Failed to load Like status:", error);
          });

      return () => {
          active = false;
      };
  }, [currentUser, post.slug]);


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
    const handleLikeClick = async () => {
      // Ask the reader to log in first.
      if (!currentUser) {
          pendingLike.current = true;

          if (onPromptLogin) {
              onPromptLogin();
          } else {
              onShowToast("Please log in to like this article.", "info");
          }

          return;
      }

      if (likeLoading) return;

      const nextState = !liked;

      setLikeLoading(true);

      try {
          const response = nextState
              ? await likeBlogPost(post.slug)
              : await unlikeBlogPost(post.slug);

          setLiked(response.liked);
          setLikesCount(response.likes);

          onToggleLike(post.id, response.liked);

          if (response.liked) {
              onShowToast("You loved this article! ❤️", "success");
          }
      } catch (error) {
          console.error("Failed to update Like:", error);
          onShowToast("Unable to update your Like. Please try again.", "info");
      } finally {
          setLikeLoading(false);
      }
  };

  // Handle Bookmark
  const handleBookmarkClick = async () => {
      if (!currentUser) {
          onPromptLogin?.();
          onShowToast("Please sign in to save this article.", "info");
          return;
      }

      if (!post.apiId) {
          onShowToast("Unable to identify this article. Please refresh.", "info");
          return;
      }

      if (bookmarkLoading) return;

      setBookmarkLoading(true);

      try {
          if (bookmarkRecordId !== null) {
              await removeReaderBookmark(bookmarkRecordId);

              setBookmarkRecordId(null);
              setBookmarked(false);

              onShowToast("Article removed from your bookmarks.", "success");
          } else {
              const result = await addReaderBookmark(post.apiId);

              setBookmarkRecordId(result.id);
              setBookmarked(true);

              onShowToast("Article saved to your reading list!", "success");
          }

          // Keep the parent application's bookmark state in sync.
          onToggleBookmark(post.id);
      } catch (error) {
          const message =
              error instanceof Error ? error.message : "Bookmark action failed.";

          onShowToast(message, "info");
      } finally {
          setBookmarkLoading(false);
      }
  };

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    onShowToast("Article link copied to clipboard! 📋", "success");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Add comment
  const handleAddComment = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!currentUser) {
          onPromptLogin?.();
          onShowToast("Please sign in before posting a comment.", "info");
          return;
      }

      const content = newCommentText.trim();

      if (content.length < 2) {
          onShowToast("Your comment must contain at least 2 characters.", "info");
          return;
      }

      if (content.length > 3000) {
          onShowToast("Your comment cannot exceed 3000 characters.", "info");
          return;
      }

      if (commentSubmitting) return;

      setCommentSubmitting(true);

      try {
          const response = await createPostComment(post.slug, content);

          setNewCommentText("");

          onShowToast(
              response.detail ||
                  "Your comment has been submitted for approval.",
              "success"
          );
      } catch (error) {
          const message =
              error instanceof Error ? error.message : "Unable to submit comment.";

          onShowToast(message, "info");
      } finally {
          setCommentSubmitting(false);
      }
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
  const latestPosts = [...allPosts]
    // .filter((item) => item.id !== post.id)
    .sort(
        (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 4);

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
                      {/* <button
                        type="button"
                        className="text-[#DF3B57] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Register</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button> */}
                      {evt.registrationUrl ? (
                          <a
                              href={evt.registrationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#DF3B57] font-bold hover:text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                              <span>Register</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                      ) : (
                          <button
                              type="button"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick(evt);
                              }}
                              className="text-slate-400 font-bold flex items-center gap-1 cursor-pointer"
                          >
                              <span>View Details</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEFT SIDE: TRENDING NOW (Explicitly requested) */}
            {/* <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-3.5">
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
            </div> */}
            
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Header */}
                <div className="px-5 pt-5 pb-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#E7F6F5] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-[#189BA3]" />
                            </div>

                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                                    Latest Blogs
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Fresh ideas &amp; musical inspiration
                                </p>
                            </div>
                        </div>

                        {/* <span className="text-[10px] font-bold uppercase tracking-wider text-[#189BA3] bg-[#E7F6F5] px-3 py-1.5 rounded-full">
                            New Reads
                        </span> */}
                    </div>
                </div>

                <div className="border-t border-slate-100 mx-5 sm:mx-6" />

                {/* Blog list */}
                <div className="p-4 sm:p-5 space-y-3">
                    {latestPosts.length > 0 ? (
                        latestPosts.map((latestPost, idx) => (
                            <button
                                key={latestPost.id}
                                type="button"
                                onClick={() => onSelectRelatedPost(latestPost)}
                                className={`w-full text-left rounded-2xl p-4 transition-all duration-300 group border ${
                                    idx === 0
                                        ? "bg-[#F0FAF9] border-[#D8EFED] hover:border-[#189BA3] hover:shadow-sm"
                                        : "bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                                }`}
                            >
                                <div className="flex items-start gap-3.5">

                                    {/* Number */}
                                    <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-sm font-extrabold ${
                                        idx === 0
                                            ? "bg-[#189BA3] text-white"
                                            : "bg-slate-100 text-slate-400 group-hover:bg-[#E7F6F5] group-hover:text-[#189BA3]"
                                    } transition-colors`}>
                                        {String(idx + 1).padStart(2, "0")}
                                    </div>

                                    <div className="flex-1 min-w-0">

                                        {/* Category and latest label */}
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#189BA3]">
                                                {latestPost.category}
                                            </span>

                                            {idx === 0 && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                    Latest
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#168C93] transition-colors">
                                            {latestPost.title}
                                        </h4>

                                        {/* Reading time */}
                                        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{latestPost.readTime} min read</span>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-[#189BA3] transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="py-8 text-center">
                            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                                <Sparkles className="w-5 h-5 text-slate-300" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">
                                No blogs available yet
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Check back soon for new stories.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {latestPosts.length > 0 && (
                    <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100">
                        <p className="text-[11px] text-center text-slate-400 font-medium">
                            Discover more stories from the world of music
                        </p>
                    </div>
                )}
            </div>



            {/* Audio demo preview if present */}
            {post.audioSnippet && (
              <AudioDemoPlayer key={post.id} snippet={post.audioSnippet} compact={false} />
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
                        {viewsCount.toLocaleString()} Reads
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
                    disabled={likeLoading}
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
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />

                            <span className="text-slate-500 text-xs sm:text-sm">
                                Signed in as:
                            </span>

                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {currentUser.name}
                            </span>
                        </div>

                        <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                            Verified
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 rounded-2xl bg-teal-50/60 border border-teal-100">
                        <div className="text-sm text-slate-600">
                            <p className="font-bold text-slate-900">
                                Sign in to join the discussion
                            </p>
                            <p className="text-xs mt-1">
                                Only verified readers can post comments.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onPromptLogin}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#189BA3] hover:bg-teal-700 text-white font-bold text-xs transition-colors"
                        >
                            Sign in / Register
                        </button>
                    </div>
                )}

                  <div className="relative">
                    <textarea
                        required
                        rows={4}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        disabled={!currentUser || commentSubmitting}
                        maxLength={3000}
                        placeholder={
                            currentUser
                                ? "Share your musical experience, questions, gear thoughts, or feedback..."
                                : "Please sign in to write a comment."
                        }
                        className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#189BA3] focus:ring-4 focus:ring-teal-500/10 resize-none transition-all leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                    <p className="text-xs text-slate-400 hidden sm:block">
                      Be respectful and supportive of fellow musicians.
                    </p>
                    <button
                        type="submit"
                        disabled={!currentUser || commentSubmitting}
                        className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#DF3B57] hover:bg-[#c92f4a] active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        <span>
                            {commentSubmitting ? "Submitting..." : "Post Comment"}
                        </span>
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4 pt-3">
                  {commentsLoading ? (
                      <div className="text-center py-8 text-sm text-slate-500">
                          Loading community comments...
                      </div>
                  ) : comments.length === 0 ? (
                      <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />

                          <h4 className="text-sm font-bold text-slate-800">
                              No approved comments yet
                          </h4>

                          <p className="text-xs text-slate-500 mt-1">
                              Be the first to share your thoughts on this article.
                          </p>
                      </div>
                  ) : (
                      comments.map((c) => (
                          <div
                              key={c.id}
                              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-3 transition-all hover:border-slate-300/80"
                          >
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm ring-2 ring-slate-100 shrink-0">
                                      {c.author
                                          .split(" ")
                                          .map((part) => part.charAt(0))
                                          .join("")
                                          .slice(0, 2)
                                          .toUpperCase()}
                                  </div>

                                  <div>
                                      <h5 className="text-sm font-bold text-slate-900">
                                          {c.author}
                                      </h5>

                                      <span className="text-xs text-slate-400">
                                          {c.date}
                                      </span>
                                  </div>
                              </div>

                              <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-12">
                                  {c.text}
                              </p>
                          </div>
                      ))
                  )}
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
