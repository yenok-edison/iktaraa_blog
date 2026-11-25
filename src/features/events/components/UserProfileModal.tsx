import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { EventItem, BookingRecord, UserAccount } from '../types/event';
import {
  X,
  User,
  Calendar,
  Ticket,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Sparkles,
  QrCode,
  MapPin,
  Mail,
  Phone,
  Building2,
  Users,
  IndianRupee,
} from 'lucide-react';


interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  events: EventItem[];
  bookings: BookingRecord[];
  onOpenAuth: (role?: 'host' | 'attendee') => void;
  onOpenCreateEvent: () => void;
  onSelectEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onLogout: () => void;
  initialTab?: 'events' | 'bookings' | 'profile';
}

type Tab = 'events' | 'bookings' | 'profile';

/* ───── Helpers ───── */

const formatPrice = (price: number | string) => {
  const n = Number(price);
  return !n ? 'Free' : `₹${n.toLocaleString('en-IN')}`;
};

const avatarFallback = (name: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=231e59`;

const CARD =
  'rounded-2xl border border-neutral-200 bg-white shadow-[0_4px_16px_rgba(35,30,89,0.05)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(35,30,89,0.09)]';

const PRIMARY_BTN =
  'bg-gradient-to-r from-[#E34060] to-[#C02D6F] text-white shadow-lg shadow-[#E34060]/25 transition active:scale-[0.97]';

/* ───── Building blocks ───── */

const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_4px_16px_rgba(35,30,89,0.05)] sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {label}
        </span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 truncate text-lg font-black leading-tight text-[#231E59] tabular-nums font-heading sm:text-2xl">
        {value}
      </p>
    </div>
  );
});

const TabButton = memo(function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  short,
  count,
  iconClass,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  short: string;
  count?: number;
  iconClass: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 text-xs font-bold transition-colors font-heading sm:flex-none sm:px-4 ${
        active
          ? 'bg-white text-[#231E59] shadow-sm ring-1 ring-neutral-200'
          : 'text-neutral-500 hover:text-neutral-800'
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{short}</span>
      {typeof count === 'number' && (
        <span className="rounded-full bg-neutral-200 px-1.5 text-[10px] tabular-nums text-neutral-700">
          {count}
        </span>
      )}
    </button>
  );
});

const InfoTile = memo(function InfoTile({
  icon: Icon,
  label,
  value,
  className = '',
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-[0_4px_16px_rgba(35,30,89,0.04)] ${className}`}>
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <p
        className={`mt-1.5 break-words text-sm font-semibold text-[#231E59] ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
});

const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  text,
  actionLabel,
  onAction,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#231E59]/10 text-[#231E59]">
        <Icon className="h-6 w-6" />
      </span>
      <h5 className="text-sm font-bold text-[#231E59] font-heading">{title}</h5>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-neutral-500">{text}</p>
      <button
        type="button"
        onClick={onAction}
        className={`mt-4 h-10 cursor-pointer rounded-xl px-5 text-xs font-bold font-heading ${PRIMARY_BTN}`}
      >
        {actionLabel}
      </button>
    </div>
  );
});

const BookingCard = memo(function BookingCard({ b }: { b: BookingRecord }) {
  return (
    <li className={`${CARD} space-y-3 p-4`}>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#23A2B3] font-heading">
            {b.city} Chapter
          </span>
          <h5 className="mt-0.5 text-sm font-black text-[#231E59] font-heading sm:text-base">
            {b.eventTitle}
          </h5>
          <p className="mt-0.5 text-xs text-neutral-500">
            {b.eventDate} · {b.venue}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-1">
          <span className="text-lg font-black text-[#E34060] tabular-nums font-heading">
            {formatPrice(b.totalAmount)}
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
            Confirmed ✓
          </span>
        </div>
      </div>

      {/* Ticket stub */}
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 items-center gap-2">
            <QrCode className="h-4 w-4 shrink-0 text-[#231E59]" />
            <span className="truncate font-mono text-[11px] font-bold text-neutral-800">
              {b.id}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500">
            <span>
              Tier <strong className="text-neutral-800">{b.tierName}</strong>
            </span>
            <span>
              Seats <strong className="text-neutral-800">{b.quantity}</strong>
            </span>
            <span>
              Paid via <strong className="text-neutral-800">{b.paymentMethod}</strong>
            </span>
          </div>
        </div>
      </div>
    </li>
  );
});

/* ───── Main component ───── */

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  bookings,
  onOpenAuth,
  onOpenCreateEvent,
  onLogout,
  initialTab,
}) => {
  const isHost = currentUser?.role === 'host';
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab || (isHost ? 'events' : 'bookings')
  );

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab || (isHost ? 'events' : 'bookings'));
  }, [isOpen, initialTab, isHost]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);


  const email = currentUser?.email.toLowerCase() ?? '';

  const myBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter((b) => b.customerEmail.toLowerCase() === email);
  }, [bookings, currentUser, email]);

  const stats = useMemo(() => {
    const seats = myBookings.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
    const spent = myBookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
    return {
      a: { label: 'Bookings', value: String(myBookings.length) },
      b: { label: 'Seats', value: String(seats) },
      c: { label: 'Total Spent', value: spent ? `₹${spent.toLocaleString('en-IN')}` : '₹0' },
    };
  }, [myBookings]);

  const handleCreate = useCallback(() => {
    onClose();
    onOpenCreateEvent();
  }, [onClose, onOpenCreateEvent]);


  if (!isOpen) return null;

  /* ───── Signed-out view ───── */
  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-[#0E0B2B]/60 backdrop-blur-sm sm:items-center sm:p-6"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sign in"
          onClick={(e) => e.stopPropagation()}
          className="relative w-full overflow-hidden rounded-t-[28px] border border-neutral-200 bg-white p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-6 duration-200 motion-reduce:animate-none sm:max-w-md sm:rounded-[28px]"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#E34060] to-[#23A2B3]" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-5 pt-2">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E34060] to-[#23A2B3] shadow-lg">
              <User className="h-8 w-8 text-white" />
            </span>

            <div>
              <h3 className="text-xl font-black text-[#231E59] font-heading">
                Sign in to your Iktaraa profile
              </h3>
              <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-neutral-500">
                See your events, booked passes and host settings in one place.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth('host');
                }}
                className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-xs font-bold font-heading ${PRIMARY_BTN}`}
              >
                Sign in as Event Creator / Host
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth('attendee');
                }}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#231E59] text-xs font-bold text-white transition hover:bg-[#1a1645] active:scale-[0.98] font-heading"
              >
                Sign in as Ticket Purchaser
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ───── Signed-in view ───── */
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0E0B2B]/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your profile"
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-neutral-200 bg-[#F6F5FB] shadow-[0_30px_80px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-6 duration-200 motion-reduce:animate-none sm:h-[85vh] sm:max-w-3xl sm:rounded-[28px]"
      >
        {/* ───── Header ───── */}
        <header className="relative shrink-0 bg-white px-4 pb-4 pt-3 sm:px-7 sm:pb-5 sm:pt-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#E34060] to-[#23A2B3]" />

          {/* Drag handle (mobile) */}
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300 sm:hidden" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm ring-1 ring-neutral-200 transition hover:bg-neutral-100 hover:text-neutral-800 sm:right-5 sm:top-5"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5 pr-10 sm:pr-0">
              <span className="rounded-2xl bg-gradient-to-tr from-[#E34060] to-[#23A2B3] p-[2px] shadow-md">
                <img
                  src={currentUser.avatar || avatarFallback(currentUser.name)}
                  alt={currentUser.name}
                  className="h-14 w-14 rounded-[14px] bg-[#231E59] object-cover sm:h-16 sm:w-16"
                />
              </span>

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg font-black text-[#231E59] font-heading sm:text-xl">
                    {currentUser.name}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-white ${
                      isHost ? 'bg-[#E34060]' : 'bg-[#23A2B3]'
                    }`}
                  >
                    {isHost ? 'Host' : 'Attendee'}
                  </span>
                </div>

                <p className="truncate text-xs text-neutral-500">{currentUser.email}</p>

                {isHost && (
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      Verified host
                      {currentUser.organization ? ` · ${currentUser.organization}` : ''}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {isHost && (
              <button
                type="button"
                onClick={handleCreate}
                className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold font-heading sm:mr-12 ${PRIMARY_BTN}`}
              >
                <PlusCircle className="h-4 w-4" />
                Manage My Events
              </button>
            )}
          </div>

          {/* Attendee stats. Host metrics are shown in the Host Dashboard. */}
          {!isHost && <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
            <StatCard
              icon={Ticket}
              label={stats.a.label}
              value={stats.a.value}
              tone="bg-[#23A2B3]/10 text-[#23A2B3]"
            />
            <StatCard
              icon={Users}
              label={stats.b.label}
              value={stats.b.value}
              tone="bg-[#E34060]/10 text-[#E34060]"
            />
            <StatCard
              icon={IndianRupee}
              label={stats.c.label}
              value={stats.c.value}
              tone="bg-emerald-50 text-emerald-600"
            />
          </div>}
        </header>

        {/* ───── Tabs ───── */}
        <div className="shrink-0 border-y border-neutral-200 bg-white px-4 py-2 sm:px-7">
          <div className="flex items-center gap-2">
            <div
              role="tablist"
              className="flex flex-1 items-center gap-1 rounded-2xl bg-neutral-100 p-1 sm:flex-none"
            >
              <TabButton
                active={activeTab === 'events'}
                onClick={() => setActiveTab('events')}
                icon={Calendar}
                label="My Events"
                short="Events"
                iconClass="text-[#E34060]"
              />
              <TabButton
                active={activeTab === 'bookings'}
                onClick={() => setActiveTab('bookings')}
                icon={Ticket}
                label="My Bookings"
                short="Bookings"
                count={myBookings.length}
                iconClass="text-[#23A2B3]"
              />
              <TabButton
                active={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
                icon={User}
                label="Account"
                short="Account"
                iconClass="text-neutral-500"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              title="Sign out"
              aria-label="Sign out"
              className="ml-auto flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-neutral-500 transition hover:bg-rose-50 hover:text-rose-600 font-heading"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* ───── Body ───── */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7">
          {/* MY EVENTS */}
          {activeTab === 'events' && (
            <section className="space-y-4">
              {isHost ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_4px_16px_rgba(35,30,89,0.05)] sm:p-7">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#231E59]/10 text-[#231E59]">
                    <Calendar className="h-7 w-7" />
                  </div>
                  <div className="mt-4 text-center">
                    <h4 className="text-base font-black text-[#231E59] font-heading">
                      Your Host Dashboard
                    </h4>
                    <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-neutral-500">
                      Create events, review all your submissions, edit event details,
                      and track bookings from one place.
                    </p>
                    <button
                      type="button"
                      onClick={handleCreate}
                      className={`mt-5 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-xs font-bold font-heading ${PRIMARY_BTN}`}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Open Host Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 p-5 sm:p-6">
                  <h4 className="text-sm font-black text-[#231E59] font-heading">
                    Host your own events
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                    Become a verified host to create and manage concerts, workshops,
                    and other events on Iktaraa.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('host');
                    }}
                    className={`mt-4 h-10 cursor-pointer rounded-xl px-4 text-xs font-bold font-heading ${PRIMARY_BTN}`}
                  >
                    Become a Verified Host
                  </button>
                </div>
              )}
            </section>
          )}

          {/* MY BOOKINGS */}
          {activeTab === 'bookings' && (
            <section className="space-y-4">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-[#231E59] font-heading">
                  My tickets ({myBookings.length})
                </h4>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Your digital passes with QR check-in
                </p>
              </div>

              {myBookings.length > 0 ? (
                <ul className="space-y-3">
                  {myBookings.map((b) => (
                    <BookingCard key={b.id} b={b} />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={Ticket}
                  title="No passes yet"
                  text="Explore shows, clinics and studio residencies to reserve your first seat."
                  actionLabel="Explore Events"
                  onAction={onClose}
                />
              )}
            </section>
          )}

          {/* ACCOUNT */}
          {activeTab === 'profile' && (
            <section className="space-y-4">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-[#231E59] font-heading">
                  Account details
                </h4>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Your verified credentials and host status
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoTile
                  icon={User}
                  label="Account type"
                  value={isHost ? 'Event Creator / Host' : 'Ticket Purchaser'}
                />
                <InfoTile icon={User} label="Full name" value={currentUser.name} />
                <InfoTile icon={Mail} label="Email" value={currentUser.email} mono />
                <InfoTile
                  icon={Phone}
                  label="Mobile"
                  value={currentUser.phone || 'Not added'}
                  mono
                />

                {isHost && (
                  <>
                    <InfoTile
                      icon={Building2}
                      label="Organisation"
                      value={currentUser.organization || 'Not added'}
                    />
                    <InfoTile
                      icon={MapPin}
                      label="City"
                      value={currentUser.city || 'Not added'}
                    />
                    <InfoTile
                      icon={User}
                      label="Bio"
                      value={currentUser.bio || 'Not added'}
                      className="sm:col-span-2"
                    />
                  </>
                )}
              </div>

              {!isHost && (
                <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h5 className="flex items-center gap-1.5 text-xs font-black text-[#231E59] font-heading">
                      <Sparkles className="h-3.5 w-3.5 text-[#E34060]" />
                      Artist, curator or venue host?
                    </h5>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-600">
                      Become a verified host to list your own events.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('host');
                    }}
                    className={`h-10 shrink-0 cursor-pointer rounded-xl px-4 text-xs font-bold font-heading ${PRIMARY_BTN}`}
                  >
                    Verify &amp; Become Host
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};