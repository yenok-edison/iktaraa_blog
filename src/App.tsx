import React, { useState, useEffect } from "react";
import { Header } from "./components/Header.tsx";
import { BlogListView } from "./components/BlogListView.tsx";
import { BlogDetailView } from "./components/BlogDetailView.tsx";
import { Footer } from "./components/Footer.tsx";
import { EventModal } from "./components/EventModal.tsx";
import { LoginModal } from "./components/LoginModal.tsx";
import { ToastContainer, ToastMessage } from "./components/Toast.tsx";
import {
  BLOG_POSTS,
  BLOG_CATEGORIES,
  UPCOMING_EVENTS,
  BlogPost,
  MusicEvent,
} from "./data/blogs.ts";

export default function App() {
  const [activeView, setActiveView] = useState<"list" | "detail">("list");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem("iktaraa_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
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

  const showToast = (message: string, type: "success" | "info" = "success") => {
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
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
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
      const next = liked ? [...prev, id] : prev.filter((item) => item !== id);
      try {
        localStorage.setItem("iktaraa_liked", JSON.stringify(next));
      } catch {
        // localStorage could be disabled
      }
      return next;
    });
  };

  // Select Blog Post for Full Landing Page
  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    setActiveView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Go back to list
  const handleBackToList = () => {
    setActiveView("list");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Select Category from Hero or Dropdown
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (activeView === "detail") {
      setActiveView("list");
    }
    // Scroll smoothly to exploration section
    const el = document.getElementById("blog-catalog-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle Login success
  const handleLoginSuccess = (user: { name: string; email: string }) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("iktaraa_user", JSON.stringify(user));
    } catch {
      // safe
    }
    showToast(`Welcome back, ${user.name}! 🎵`, "success");
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("iktaraa_user");
    } catch {
      // safe
    }
    showToast("Signed out successfully", "info");
  };

  // Handle Event RSVP confirm
  const handleConfirmRsvp = (eventTitle: string, attendeeName: string) => {
    showToast(`Spot confirmed for ${attendeeName}! Check your WhatsApp.`, "success");
  };

  // Handle Newsletter Subscribe
  const handleNewsletterSubscribe = (email: string) => {
    showToast(`Subscribed ${email} to weekly guitar & music tips!`, "success");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFC] text-slate-800 antialiased">
      {/* Top Header with Buy, Learn, Connect in middle */}
      <Header
        onGoHome={handleBackToList}
        onLoginClick={() => setLoginModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onCategoryClick={(cat) => handleCategorySelect(cat)}
        activeCategory={selectedCategory}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {activeView === "list" ? (
          /* Main Blog explorer starting immediately with clean screenshot spacing */
          <div id="blog-catalog-section">
            <BlogListView
              posts={BLOG_POSTS}
              categories={BLOG_CATEGORIES}
              upcomingEvents={UPCOMING_EVENTS}
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
          /* Specific Blog Landing Page */
          selectedPost && (
            <BlogDetailView
              post={selectedPost}
              allPosts={BLOG_POSTS}
              upcomingEvents={UPCOMING_EVENTS}
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

      {/* Footer */}
      <Footer
        onGoHome={handleBackToList}
        onCategorySelect={handleCategorySelect}
      />

      {/* Login / Identity Modal */}
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

      {/* Toast Feedback Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
