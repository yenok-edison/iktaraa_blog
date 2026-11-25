import React from 'react';
import { User, ChevronDown, ShieldCheck } from 'lucide-react';
import { IktaraaLogo } from './IktaraaLogo';
import { UserAccount } from '../types/event';

interface HeaderProps {
  onHomeClick?: () => void;
  onOpenProfile: () => void;
  currentUser: UserAccount | null;
  bookingsCount?: number;
  myEventsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onHomeClick,
  onOpenProfile,
  currentUser,
  bookingsCount = 0,
  myEventsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        
        {/* Authentic Iktaraa SVG Logo */}
        <div className="shrink-0 flex items-center">
          <IktaraaLogo
            height="h-8 sm:h-10 md:h-11"
            onClick={onHomeClick}
          />
        </div>

        {/* Unified Profile Icon (All account features, My Events, My Bookings, Profile accessed here) */}
        <div className="flex items-center shrink-0">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:px-3 sm:py-2 bg-neutral-50 hover:bg-neutral-100 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition-all text-left cursor-pointer group shadow-2xs"
            title={currentUser ? `Signed in as ${currentUser.name} (${currentUser.role === 'host' ? 'Event Creator' : 'Ticket Purchaser'})` : 'Sign in to access your profile'}
          >
            {currentUser ? (
              <>
                <div className="relative">
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}&backgroundColor=231e59`}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover bg-neutral-200 ring-2 ring-[#231E59]/10 group-hover:ring-[#231E59]/30 transition-all"
                  />
                  {currentUser.verifiedHost ? (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] ring-2 ring-white" title="OTP Verified Host">
                      ✓
                    </span>
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                  )}
                </div>

                {/* <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#231E59] group-hover:text-[#E34060] transition-colors leading-tight max-w-[100px] sm:max-w-[130px] truncate font-heading">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
                  </div>
                  <div className="flex items-center gap-1 leading-none mt-0.5">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        currentUser.role === 'host' ? 'text-[#E34060]' : 'text-[#23A2B3]'
                      }`}
                    >
                      {currentUser.role === 'host' ? 'Host' : 'Purchaser'}
                    </span>
                    {currentUser.role === 'host' && myEventsCount > 0 && (
                      <span className="text-[9px] text-neutral-400">· {myEventsCount} {myEventsCount === 1 ? 'event' : 'events'}</span>
                    )}
                    {currentUser.role === 'attendee' && bookingsCount > 0 && (
                      <span className="text-[9px] text-neutral-400">· {bookingsCount} {bookingsCount === 1 ? 'pass' : 'passes'}</span>
                    )}
                  </div>
                </div> */}

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="max-w-[100px] truncate text-xs font-bold leading-tight text-[#231E59] transition-colors group-hover:text-[#E34060] sm:max-w-[130px] font-heading">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-400 transition-colors group-hover:text-neutral-700" />
                  </div>

                  <div className="mt-0.5 flex items-center gap-1 leading-none">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        currentUser.role === 'host'
                          ? 'text-[#E34060]'
                          : 'text-[#23A2B3]'
                      }`}
                    >
                      {currentUser.role === 'host' ? 'Host' : 'Purchaser'}
                    </span>

                    {currentUser.role === 'host' && myEventsCount > 0 && (
                      <span className="text-[9px] text-neutral-400">
                        · {myEventsCount} {myEventsCount === 1 ? 'event' : 'events'}
                      </span>
                    )}

                    {currentUser.role === 'attendee' && bookingsCount > 0 && (
                      <span className="text-[9px] text-neutral-400">
                        · {bookingsCount} {bookingsCount === 1 ? 'pass' : 'passes'}
                      </span>
                    )}
                  </div>
                </div>

              </>
            ) : (
              <div className="flex items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-xl bg-[#231E59]/10 text-[#231E59] flex items-center justify-center group-hover:bg-[#231E59] group-hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-[#231E59] group-hover:text-[#E34060] transition-colors font-heading leading-tight">
                    Account & Profile
                  </span>
                  <span className="text-[9px] text-neutral-500 font-medium">
                    Host or Purchaser
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1" />
              </div>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
