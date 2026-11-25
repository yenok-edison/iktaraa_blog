import React from 'react';
import { IktaraaLogo } from './IktaraaLogo';
import { SITE_METADATA } from '../data/site';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenHostPortal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenHostPortal,
}) => {
  return (
    <footer className="bg-[#231E59] text-white border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10 text-xs">
          
          {/* Brand Col (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <IktaraaLogo variant="light" height="h-8" />
            </div>

            <p className="text-neutral-300 leading-relaxed max-w-sm font-light">
              {SITE_METADATA.description}
            </p>

            <div className="pt-2 text-[11px] text-[#23A2B3] font-semibold">
              Designed for true listeners, cultural storytelling, and acoustic mastery.
            </div>
          </div>

          {/* Nav Links Col */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-wider text-[#23A2B3] text-[11px]">
              Explore Platform
            </p>
            <ul className="space-y-2 text-neutral-300">
              <li>
                <button
                  onClick={() => onSelectCategory('Events')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Live Acoustic Concerts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Workshops')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Clinics & Masterclasses
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Music Studio')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Studio Tracking Sessions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Jam Sessions')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Acoustic Open Mic Circles
                </button>
              </li>
            </ul>
          </div>

          {/* Creators Col */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-wider text-[#E34060] text-[11px]">
              For Artists & Venues
            </p>
            <ul className="space-y-2 text-neutral-300">
              <li>
                <button
                  onClick={onOpenHostPortal}
                  className="hover:text-white transition-colors cursor-pointer font-semibold text-[#E34060]"
                >
                  Host Portal & SaaS Dashboard
                </button>
              </li>
              <li>
                <span className="text-neutral-400">Venue Audits & Acoustic Soundchecks</span>
              </li>
              <li>
                <span className="text-neutral-400">Direct 48-Hour Payouts</span>
              </li>
              <li>
                <span className="text-neutral-400">Anti-Scalp QR Ticketing</span>
              </li>
            </ul>
          </div>

          {/* Cities Col */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-wider text-white text-[11px]">
              Active Chapters
            </p>
            <ul className="space-y-1.5 text-neutral-300">
              <li>Chennai (Alwarpet · T. Nagar)</li>
              <li>Bengaluru (Domlur · Indiranagar)</li>
              <li>Mumbai (Bandra West · Pali Hill)</li>
              <li>Delhi-NCR (Lodhi Estate)</li>
              <li>Hyderabad (Jubilee Hills)</li>
            </ul>
          </div>

        </div>

        {/* Quiet Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} Iktaraa Arts & Sounds Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-200 cursor-pointer">Terms of Service</span>
            <span className="hover:text-neutral-200 cursor-pointer">Refund Protection</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
