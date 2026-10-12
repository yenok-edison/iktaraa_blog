import React, { useState } from "react";
import { User, LogOut, ShoppingBag, GraduationCap, Users, Menu, X, ChevronRight, Sparkles } from "lucide-react";
import { IktaraaLogo } from "./IktaraaLogo.tsx";

interface HeaderProps {
  onGoHome?: () => void;
  onLoginClick?: () => void;
  currentUser?: { name: string; email: string } | null;
  onLogout?: () => void;
  onCategoryClick?: (categorySlug: string) => void;
  activeCategory?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onLoginClick,
  currentUser,
  onLogout,
  onCategoryClick,
  activeCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNavClick = (categorySlug: string) => {
    onCategoryClick?.(categorySlug);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left: Official Iktaraa Logo */}
          
            <div
              onClick={() => {
                onGoHome?.();
                setMobileMenuOpen(false);
              }}
              className="flex items-center cursor-pointer select-none group py-2 shrink-0"
            >
              <img
                src="/iktaraa.svg"
                alt="Iktaraa"
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
            </div>

            {/* Desktop Center: Buy, Learn, Connect (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center gap-2.5 lg:gap-3.5">
              <button
                type="button"
                onClick={() => onCategoryClick?.("instruments")}
                className={`px-5 lg:px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                  activeCategory === "instruments"
                    ? "bg-slate-900 text-white shadow-sm scale-105"
                    : "bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200/90"
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-teal-600" />
                <span>Buy</span>
              </button>

              <button
                type="button"
                onClick={() => onCategoryClick?.("learning")}
                className={`px-5 lg:px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                  activeCategory === "learning"
                    ? "bg-slate-900 text-white shadow-sm scale-105"
                    : "bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200/90"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-rose-500" />
                <span>Learn</span>
              </button>

              <button
                type="button"
                onClick={() => onCategoryClick?.("events")}
                className={`px-5 lg:px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                  activeCategory === "events"
                    ? "bg-slate-900 text-white shadow-sm scale-105"
                    : "bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200/90"
                }`}
              >
                <Users className="w-4 h-4 text-amber-500" />
                <span>Connect</span>
              </button>
            </nav>

            {/* Right Action: Desktop User / Login & Mobile Hamburger Toggle */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              {/* User Profile or Login Button (Desktop & Mobile) */}
              {currentUser ? (
                <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-50 border border-slate-200/80 px-3 sm:px-4 py-1.5 rounded-full shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#189BA3] to-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left min-w-0 max-w-[160px]">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate leading-tight">
                      {currentUser.email}
                    </p>
                  </div>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="p-1 rounded-full text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="hidden sm:flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 active:scale-95 font-bold text-sm shadow-2xs transition-all cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-600" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Sheet Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-5 space-y-4">
              {/* Heading */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>Explore Iktaraa</span>
                <span className="flex items-center gap-1 text-teal-700 font-bold normal-case text-[11px]">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  Music Hub
                </span>
              </div>

              {/* Navigation Options */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleMobileNavClick("instruments")}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                    activeCategory === "instruments"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-700 flex items-center justify-center font-bold">
                      <ShoppingBag className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold leading-tight">Buy Instruments & Gear</p>
                      <p className={`text-[10px] ${activeCategory === "instruments" ? "text-slate-300" : "text-slate-500"}`}>
                        Verified luthiers, guitars & acoustics
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMobileNavClick("learning")}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                    activeCategory === "learning"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center font-bold">
                      <GraduationCap className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold leading-tight">Learn Masterclasses</p>
                      <p className={`text-[10px] ${activeCategory === "learning" ? "text-slate-300" : "text-slate-500"}`}>
                        Raga theory, maestro breakdowns & tabs
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMobileNavClick("events")}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                    activeCategory === "events"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                      <Users className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold leading-tight">Connect & Jams</p>
                      <p className={`text-[10px] ${activeCategory === "events" ? "text-slate-300" : "text-slate-500"}`}>
                        Community jam sessions & live workshops
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              </div>

              {/* Mobile Login Prompt if user is not signed in */}
              {!currentUser && (
                <div className="pt-2 border-t border-slate-100 sm:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLoginClick?.();
                    }}
                    className="w-full py-3 rounded-2xl bg-[#189BA3] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-teal-200 cursor-pointer active:scale-98 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In to Iktaraa Community</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-2xs md:hidden"
        />
      )}
    </>
  );
};
