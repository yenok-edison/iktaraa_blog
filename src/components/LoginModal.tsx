import React, { useState } from "react";
import { X, ExternalLink, User, Mail, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { IktaraaLogo } from "./IktaraaLogo.tsx";

interface UserProfile {
  name: string;
  email: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    onLoginSuccess({
      name: name.trim(),
      email: email.trim().toLowerCase(),
    });
    window.open(loginPortalUrl, "_blank", "noopener,noreferrer");
    setName("");
    setEmail("");
    setError("");
    onClose();
  };

  const loginPortalUrl = "https://www.iktaraa.com/login?callbackUrl=%2F";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          aria-label="Close login dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            {/* <IktaraaLogo size="sm" /> */}
            <img
                src="/iktaraa.svg"
                alt="Iktaraa"
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Iktaraa
          </h3>
          <p className="text-xs text-slate-500">
            Join the musician community, comment on stories, and bookmark guides
          </p>
        </div>

        {/* Official Portal Redirect Notice */}
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200/80 text-xs text-teal-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-700" />
              <span>Official Iktaraa Account</span>
            </span>
            <a
              href={loginPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-[#189BA3] hover:underline flex items-center gap-1"
            >
              <span>Open Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[11px] text-teal-800 leading-relaxed">
            You can verify your profile via the official portal at{" "}
            <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-teal-200 select-all">
              iktaraa.com/login
            </span>{" "}
            or enter your details below to activate your blog identity.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. Sreya Narayanan"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. sreya.music@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Your name & email will be displayed on comments you post.
              </p>
            </div>
          </div>

          {/* <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#189BA3] hover:bg-[#147e85] active:scale-95 text-white font-bold text-xs shadow-md shadow-teal-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Submit & Save Identity</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <a
                href={loginPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
              ></a>
            </button>

          </div> */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#189BA3] hover:bg-[#147e85] active:scale-95 text-white font-bold text-xs shadow-md shadow-teal-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Submit & Save Identity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Secure authentication for Iktaraa Blog Readers</span>
        </div>
      </div>
    </div>
  );
};
