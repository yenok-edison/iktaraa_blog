
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Header } from "./shared/components/Header.tsx";
// import { BlogListView } from "./components/BlogListView.tsx";
// import { BlogDetailView } from "./components/BlogDetailView.tsx";
import { BlogListView } from "./features/blog/components/BlogListView.tsx";
import { BlogDetailView } from "./features/blog/components/BlogDetailView.tsx";
import { Footer } from "./shared/components/Footer.tsx";
import { EventModal } from "./shared/components/EventModal.tsx";
import { LoginModal } from "./shared/components/LoginModal.tsx";
import { ToastContainer, ToastMessage } from "./shared/components/Toast.tsx";

import {
  BLOG_POSTS,
  BLOG_CATEGORIES,
  UPCOMING_EVENTS,
} from "./features/blog/data/blogs.ts";

import type {
  BlogPost,
  MusicEvent,
} from "./features/blog/data/blogs.ts";

import type { BlogCategory } from "./features/blog/types/blog.ts";

import {
    fetchBlogPosts,
    fetchCategories,
    fetchMusicEvents,
    // fetchReaderMe,
    // logoutReader,
} from "./features/blog/services/blogApi";

import {
  adaptBlogPosts,
  adaptCategories,
  adaptMusicEvents,
} from "./features/blog//services/blogAdapter";

import { useAuth } from "./shared/auth/AuthContext";
import type { ApiReader } from "./features/blog/services/blogApi";

export default function App() {
  // const [activeView, setActiveView] = useState<"list" | "detail">("list");
  // const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Blog data - static data is used as fallback
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [categories, setCategories] =
    useState<BlogCategory[]>(BLOG_CATEGORIES);
  const [upcomingEvents, setUpcomingEvents] =
    useState<MusicEvent[]>(UPCOMING_EVENTS);

  const selectedPost = slug
    ? posts.find((post) => post.slug === slug) ?? null
    : null;

  // Determine which view to display from the URL
  const activeView = slug ? "detail" : "list";

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load data from Django API
  useEffect(() => {
    let isMounted = true;

    const loadBlogData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        const [postsResponse, categoriesResponse, eventsResponse] =
          await Promise.all([
            fetchBlogPosts(),
            fetchCategories(),
            fetchMusicEvents(),
          ]);

        if (!isMounted) return;

        // Convert Django API responses into frontend data formats
        const formattedPosts = adaptBlogPosts(postsResponse.results);
        const formattedCategories = adaptCategories(categoriesResponse);
        const formattedEvents = adaptMusicEvents(eventsResponse);

        setPosts(formattedPosts);
        setCategories(formattedCategories);
        setUpcomingEvents(formattedEvents);

        console.log("Blog data loaded successfully from Django API.");
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load blog data:", error);

        setApiError(
          error instanceof Error
            ? error.message
            : "Unable to connect to the blog API."
        );

        // Keep the existing static data if the API is unavailable
        setPosts(BLOG_POSTS);
        setCategories(BLOG_CATEGORIES);
        setUpcomingEvents(UPCOMING_EVENTS);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBlogData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Authenticated user state
  // ============================================================
  // AUTHENTICATED READER STATE
  // ============================================================

  const { currentUser, login, logout } = useAuth();

  // Restore reader session when the application loads
  

  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Persistent User Interactions (Bookmarks & Likes)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("iktaraa_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("iktaraa_liked");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Event modal state
  const [rsvpEvent, setRsvpEvent] = useState<MusicEvent | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    message: string,
    type: "success" | "info" = "success"
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle Bookmark
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);

      const next = exists
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      try {
        localStorage.setItem("iktaraa_bookmarks", JSON.stringify(next));
      } catch {
        // localStorage could be disabled
      }

      return next;
    });
  };

  // Toggle Like
  const handleToggleLike = (id: string, liked: boolean) => {
    setLikedIds((prev) => {
      const next = liked
        ? [...new Set([...prev, id])]
        : prev.filter((item) => item !== id);

      try {
        localStorage.setItem("iktaraa_liked", JSON.stringify(next));
      } catch {
        // localStorage could be disabled
      }

      return next;
    });
  };

  // Select Blog Post
  const handleSelectPost = (post: BlogPost) => {
    navigate(`/blogs/${post.slug}`);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Go back to list
  const handleBackToList = () => {
    navigate("/blogs");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Select Category
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);

    if (slug) {
      navigate("/blogs");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Login success
  const handleLoginSuccess = (reader: ApiReader) => {
      login(reader);

      showToast(`Welcome back, ${reader.full_name}! 🎵`, "success");
  };

  // Handle Logout
  const handleLogout = async () => {
      await logout();

      showToast("Signed out successfully", "info");
  };

  // Handle Event RSVP confirm
  const handleConfirmRsvp = (
    eventTitle: string,
    attendeeName: string
  ) => {
    showToast(
      `Spot confirmed for ${attendeeName}! Check your WhatsApp.`,
      "success"
    );
  };

  // Handle Newsletter Subscribe
  const handleNewsletterSubscribe = (email: string) => {
    showToast(
      `Subscribed ${email} to weekly guitar & music tips!`,
      "success"
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFC] text-slate-800 antialiased">

      {/* Header */}
      <Header
        onGoHome={handleBackToList}
        onLoginClick={() => setLoginModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onCategoryClick={(cat) => handleCategorySelect(cat)}
        activeCategory={selectedCategory}
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-slate-500">Loading music stories...</p>
        </div>
      ) : (
        <>
          {/* API fallback notice */}
          {apiError && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
              <p className="text-sm text-yellow-800">
                Unable to connect to the blog API. Showing demo content.
              </p>
            </div>
          )}

          {/* Main View Switcher */}
          <main className="flex-1">
            {activeView === "list" ? (
              <div id="blog-catalog-section">
                <BlogListView
                  posts={posts}
                  categories={categories}
                  upcomingEvents={upcomingEvents}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onSelectPost={handleSelectPost}
                  searchTerm={searchTerm}
                  onClearSearch={() => setSearchTerm("")}
                  bookmarkedIds={bookmarkedIds}
                  likedIds={likedIds}
                  onToggleBookmark={handleToggleBookmark}
                  onToggleLike={handleToggleLike}
                  onSubscribe={handleNewsletterSubscribe}
                  onEventClick={(evt) => setRsvpEvent(evt)}
                />
              </div>
            ) : (
              selectedPost && (
                <BlogDetailView
                  post={selectedPost}
                  allPosts={posts}
                  upcomingEvents={upcomingEvents}
                  onBack={handleBackToList}
                  onSelectRelatedPost={handleSelectPost}
                  isBookmarked={bookmarkedIds.includes(selectedPost.id)}
                  isLiked={likedIds.includes(selectedPost.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onToggleLike={handleToggleLike}
                  onShowToast={showToast}
                  onEventClick={(evt) => setRsvpEvent(evt)}
                  currentUser={currentUser}
                  onPromptLogin={() => setLoginModalOpen(true)}
                />
              )
            )}
          </main>
        </>
      )}

      {/* Footer */}
      <Footer
        onGoHome={handleBackToList}
        onCategorySelect={handleCategorySelect}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Event RSVP Modal */}
      <EventModal
        event={rsvpEvent}
        onClose={() => setRsvpEvent(null)}
        onConfirm={handleConfirmRsvp}
      />

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}
