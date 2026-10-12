import React from "react";
import { MapPin, Phone, Mail, Heart } from "lucide-react";
import { SOCIAL_MEDIA_LINKS, CONTACT_DETAILS } from "../data/blogs.ts";
import { IktaraaLogo } from "./IktaraaLogo.tsx";

interface FooterProps {
  onGoHome?: () => void;
  onCategorySelect?: (categoryId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onGoHome, onCategorySelect }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Tagline with official logo */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={onGoHome}
              className="flex flex-col cursor-pointer select-none group inline-block py-1"
            >
              <img
                src="/iktaraa.svg"
                alt="Iktaraa"
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain hover:opacity-90 transition-opacity"
              />
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              India's premier digital sanctuary connecting musical instrument stores,
              certified maestros, touring artists, and passionate learners.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{CONTACT_DETAILS.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{CONTACT_DETAILS.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{CONTACT_DETAILS.location}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Blog Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Blog Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onCategorySelect && onCategorySelect("instruments")}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Instruments & Gear Guides
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect && onCategorySelect("learning")}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Learn & Master Ragas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect && onCategorySelect("production")}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Home Studio & Acoustics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect && onCategorySelect("events")}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Live Gigs & Tours
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect && onCategorySelect("artists")}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Artist Backstories
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Iktaraa Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Explore Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-teal-400 cursor-pointer">Find Nearby Music Stores</li>
              <li className="hover:text-teal-400 cursor-pointer">Book Certified Teachers</li>
              <li className="hover:text-teal-400 cursor-pointer">Become a Music Instructor</li>
              <li className="hover:text-teal-400 cursor-pointer">List Your Music School</li>
              <li className="hover:text-teal-400 cursor-pointer">Musical Instruments Repair</li>
              <li className="hover:text-teal-400 cursor-pointer">Luthier Warranty Check</li>
            </ul>
          </div>

          {/* Col 4: Social Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Follow Our Beats
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {SOCIAL_MEDIA_LINKS.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] text-slate-500">{s.followers.split(" ")[0]}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Iktaraa Digital Music Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for musicians across the globe</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
