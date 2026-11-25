import React, { useState, useEffect } from 'react';
import { EventItem, TicketTier } from '../types/event';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Bookmark,
  Coffee,
  CheckCircle2,
  ShieldCheck,
  Flame,
  ChevronLeft,
  HeartHandshake,
  Car,
  Zap,
  Globe,
  Key,
  Building2,
  ExternalLink,
  Plus,
  Minus,
  ArrowRight,
  Ticket,
  Timer,
  Languages,
  Sparkles,
  Users,
  Star,
  CalendarCheck,
} from 'lucide-react';

import { fetchEventPlatformEvent } from "../services/eventApi";
import type { EventPlatformItem } from "../services/eventApi";

interface EventDetailViewProps {
  event: EventItem;
  onBack: () => void;
  onProceedToBooking: (
    event: EventItem,
    tier: TicketTier,
    quantity: number,
    selectedAddOns: string[],
    addOnsTotal: number
  ) => void;
}

/* ─────────────────────────────────────────────────────────────
 * Small presentational helpers (outside the component)
 * ───────────────────────────────────────────────────────────── */

const SECTION_CARD =
  'bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 scroll-mt-24';

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <div className="mb-4">
    <h2 className="text-lg sm:text-xl font-bold text-[#231E59] font-heading leading-tight">
      {title}
    </h2>
    {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
  </div>
);

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  event,
  onBack,
  onProceedToBooking,
}) => {
  const [selectedTier, setSelectedTier] = useState<TicketTier>(event.ticketTiers[0]);
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [apiEvent, setApiEvent] = useState<EventPlatformItem | null>(null);
  const [apiEventLoading, setApiEventLoading] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());

  const displayEvent: EventItem = apiEvent
    ? {
        ...event,
        id: String(apiEvent.id),
        slug: apiEvent.slug,
        title: apiEvent.title,
        subtitle: apiEvent.short_description || "",
        description: apiEvent.description || "",
        tagline: apiEvent.short_description || apiEvent.title,
        detailedAbout: apiEvent.description
          ? [apiEvent.description]
          : [],
        price: Number(apiEvent.price || 0),
        date: new Date(apiEvent.start_datetime).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        time: new Date(apiEvent.start_datetime).toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
        }),
        venue: apiEvent.is_online
          ? "Online Event"
          : apiEvent.venue_name || "Venue to be announced",
        locality: apiEvent.address || "",
        city: apiEvent.city || "",
        comfortsFromHost: apiEvent.comforts || [],
        google_maps_url: apiEvent.google_maps_url || "",
        capacity: apiEvent.capacity || 0,
        reservedSeats: apiEvent.reserved_seats || 0,
        availableSeats: apiEvent.available_seats ?? apiEvent.capacity ?? 0,
        bookingFull: apiEvent.booking_full ?? false,
        isoDate: apiEvent.start_datetime,
        image: apiEvent.cover_image || event.image,
        coverImage: apiEvent.cover_image || event.coverImage,
        ticketTiers: event.ticketTiers.map((tier, index) => ({
          ...tier,
          price: Number(apiEvent.price || 0),
          available: apiEvent.available_seats ?? apiEvent.capacity ?? 0,
        })).map((tier, index) =>
          index === 0 ? tier : { ...tier, available: 0 }
        ),
        host: {
          ...event.host,
          name: apiEvent.host_name || event.host.name,
        },
      }
    : event;

  useEffect(() => {
    if (apiEvent && displayEvent.ticketTiers.length > 0) {
      setSelectedTier(displayEvent.ticketTiers[0]);
      setTicketQuantity(1);
    }
  }, [apiEvent]);

  useEffect(() => {
    if (!event?.slug) {
      setApiEvent(null);
      return;
    }

    let isActive = true;

    const loadEventDetails = async () => {
      setApiEventLoading(true);

      try {
        const data = await fetchEventPlatformEvent(event.slug!);

        if (isActive) {
          setApiEvent(data);
        }
      } catch (error) {
        console.error("Failed to load event details:", error);

        if (isActive) {
          setApiEvent(null);
        }
      } finally {
        if (isActive) {
          setApiEventLoading(false);
        }
      }
    };

    loadEventDetails();

    return () => {
      isActive = false;
    };
  }, [event?.slug]);

  // Live clock for the countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle add-ons
  const handleToggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add-ons total
  const addOnsTotal = (event.addOns || [])
    .filter((a) => selectedAddOnIds.includes(a.id))
    .reduce((sum, item) => sum + item.price, 0);

  const subtotal = selectedTier.price * ticketQuantity + addOnsTotal;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleBookNow = () => {
    const currentAvailableSeats = Math.max(
      0,
      displayEvent.availableSeats ??
        displayEvent.ticketTiers.reduce(
          (total, tier) => total + Math.max(0, tier.available || 0),
          0
        )
    );

    const currentTierAvailable = Math.max(
      0,
      selectedTier.available || 0
    );

    if (
      displayEvent.bookingFull === true ||
      currentAvailableSeats === 0 ||
      currentTierAvailable === 0 ||
      ticketQuantity > currentAvailableSeats ||
      ticketQuantity > currentTierAvailable
    ) {
      return;
    }

    onProceedToBooking(
      displayEvent,
      selectedTier,
      ticketQuantity,
      event.addOns
        ?.filter((a) => selectedAddOnIds.includes(a.id))
        .map((a) => a.name) || [],
      addOnsTotal
    );
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Countdown
  const eventTimestamp = displayEvent.isoDate
    ? new Date(displayEvent.isoDate).getTime()
    : NaN;
  const hasValidDate = !Number.isNaN(eventTimestamp);
  const diff = hasValidDate ? eventTimestamp - now : 0;
  const hasStarted = hasValidDate && diff <= 0;
  const countdown = {
    days: Math.max(0, Math.floor(diff / 86400000)),
    hours: Math.max(0, Math.floor((diff % 86400000) / 3600000)),
    minutes: Math.max(0, Math.floor((diff % 3600000) / 60000)),
    seconds: Math.max(0, Math.floor((diff % 60000) / 1000)),
  };
  const pad = (n: number) => String(n).padStart(2, '0');

  // Seat availability
  const seatsLeft = displayEvent.ticketTiers.reduce(
    (sum, tier) => sum + (tier.available || 0),
    0
  );
  const capacity = displayEvent.capacity || 0;
  const seatsLeftPercent =
    capacity > 0 ? Math.min(100, Math.max(0, (seatsLeft / capacity) * 100)) : 0;
  const showSeatMeter = capacity > 0 && seatsLeft > 0;

  const renderComfortIcon = (iconName: string) => {
    const cls = 'w-4 h-4 text-[#1B8795]';
    switch (iconName) {
      case 'Coffee':
        return <Coffee className={cls} />;
      case 'QrCode':
      case 'FastCheckIn':
        return <Zap className={cls} />;
      case 'Users':
      case 'Social':
        return <Globe className={cls} />;
      case 'Key':
      case 'AllAges':
        return <Key className={cls} />;
      case 'Home':
      case 'Indoor':
        return <Building2 className={cls} />;
      case 'HeartHandshake':
      case 'Family':
        return <HeartHandshake className={cls} />;
      case 'Car':
        return <Car className={cls} />;
      default:
        return <CheckCircle2 className={cls} />;
    }
  };

  // Cover image comes from the API (cover_image) when available
  const heroImage = displayEvent.coverImage || displayEvent.image || undefined;

  const glassBtn =
    'h-8 px-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer';

  const infoTiles = [
    { icon: Calendar, label: 'Date', value: displayEvent.date },
    { icon: Clock, label: 'Time', value: displayEvent.time },
    { icon: Timer, label: 'Duration', value: displayEvent.duration },
    { icon: Languages, label: 'Language', value: displayEvent.language },
  ];

  const availableSeats = Math.max(
    0,
    displayEvent.availableSeats ??
      displayEvent.ticketTiers.reduce(
        (total, tier) => total + Math.max(0, tier.available || 0),
        0
      )
  );

  const selectedTierAvailable = Math.max(
    0,
    selectedTier.available || 0
  );

  const isBookingFull =
    displayEvent.bookingFull === true || availableSeats === 0;

  // Max guests allowed right now (6 per booking, capped by seats left)
  const maxGuests = Math.max(1, Math.min(6, availableSeats, selectedTierAvailable));

  const mapsHref =
    displayEvent.google_maps_url?.trim() ||
    `https://maps.google.com/?q=${encodeURIComponent(
      `${displayEvent.venue}, ${displayEvent.locality}, ${displayEvent.city}`
    )}`;

  const aboutParagraphs = displayEvent.detailedAbout || [];
  const frontendComforts = displayEvent.comforts || [];
  const hostComforts = displayEvent.comfortsFromHost || [];
  const hasComforts = frontendComforts.length > 0 || hostComforts.length > 0;

  const navItems = [
    { id: 'about', label: 'About' },
    ...(hasComforts ? [{ id: 'comforts', label: 'Comforts' }] : []),
    { id: 'location', label: 'Location' },
    { id: 'host', label: 'Host' },
  ];

  return (
    <div className="bg-[#F6F5FB] pb-24 lg:pb-12">
      {apiEventLoading && (
        <div className="text-center py-1.5 text-xs font-medium text-[#231E59] bg-[#23A2B3]/10">
          Updating event details...
        </div>
      )}

      {/* ───────────── Compact Hero: cover + key info ───────────── */}
      <div className="relative overflow-hidden bg-[#10172F] text-white">
        {/* Blurred backdrop made from the cover image */}
        {heroImage ? (
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-45"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B286B] via-[#302A63] to-[#17A7A6]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#10172F]/70 via-[#231E59]/55 to-[#10172F]/90" />
        <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-[#E34060]/25 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-64 h-64 rounded-full bg-[#23A2B3]/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3">
            <button onClick={onBack} className={glassBtn}>
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to All Experiences</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button onClick={handleShare} className={glassBtn}>
                <Share2 className="w-3.5 h-3.5" />
                <span>{shareCopied ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`h-8 px-3 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-xl ${
                  isWishlisted
                    ? 'bg-[#E34060] border-[#E34060] text-white'
                    : 'bg-white/15 hover:bg-white/25 border-white/25 text-white'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
                <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
            {/* Cover image card */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.45)] bg-[#10172F] aspect-[16/10]">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={displayEvent.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8B286B] via-[#302A63] to-[#17A7A6]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1026]/75 via-transparent to-[#0E1026]/25" />

                {/* Badges on the cover */}
                <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center gap-1.5">
                  {displayEvent.category && (
                    <span className="bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase font-heading">
                      {displayEvent.category || 'Uncategorized'}
                    </span>
                  )}
                  {displayEvent.isRecommended && (
                    <span className="bg-[#23A2B3] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 font-heading">
                      <Sparkles className="w-3 h-3" />
                      Recommended
                    </span>
                  )}
                  {(isBookingFull || displayEvent.isSellingFast) && (
                    <span
                      className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 font-heading ${
                        isBookingFull ? "bg-neutral-600" : "bg-[#E34060]"
                      }`}
                    >
                      {isBookingFull ? (
                        "Booking Full"
                      ) : (
                        <>
                          <Flame className="w-3 h-3" />
                          Selling Fast
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Price tag on the cover */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                  {displayEvent.genre ? (
                    <span className="bg-[#231E59]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase font-heading">
                      {displayEvent.genre}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="bg-white/95 text-[#231E59] rounded-xl px-3 py-1.5 text-right shadow-lg">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400 leading-none">
                      From
                    </span>
                    <span className="block text-lg font-black font-heading leading-tight tabular-nums">
                      ₹{displayEvent.ticketTiers[0]?.price ?? selectedTier.price}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Title + info */}
            <div className="lg:col-span-7 min-w-0 space-y-3.5">
              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black font-heading tracking-tight leading-[1.1] drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
                  {displayEvent.title}
                </h1>
                {displayEvent.nativeTitle && (
                  <p
                    className="mt-1 text-base sm:text-xl font-bold font-heading bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(100deg, #FF8FA8 0%, #E34060 100%)',
                    }}
                  >
                    {displayEvent.nativeTitle}
                  </p>
                )}
                <p className="mt-2 text-xs sm:text-sm text-white/75 font-light leading-relaxed max-w-2xl line-clamp-3">
                  {displayEvent.subtitle || displayEvent.description}
                </p>
              </div>

              {/* Key info tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {infoTiles.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2.5 min-w-0"
                    >
                      <Icon className="w-4 h-4 text-[#78DED5] shrink-0" />
                      <div className="min-w-0 leading-tight">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-white/50">
                          {item.label}
                        </p>
                        <p className="text-xs font-bold truncate">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Venue */}
              <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2.5 text-xs min-w-0">
                <MapPin className="w-4 h-4 text-[#78DED5] shrink-0" />
                <span className="font-semibold truncate">
                  {displayEvent.venue}
                  {displayEvent.city ? `, ${displayEvent.city}` : ''}
                </span>
              </div>

              {/* Countdown + CTA */}
              <div className="flex flex-wrap items-center gap-2.5">
                {hasValidDate && (
                  <div className="inline-flex items-center gap-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/15 pl-3 pr-4 h-10">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#E34060] opacity-75 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E34060]" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#78DED5]">
                      {hasStarted ? 'Event Started' : 'Starts in'}
                    </span>
                    {!hasStarted && (
                      <span className="text-sm font-black font-heading tabular-nums">
                        {countdown.days}d {pad(countdown.hours)}h {pad(countdown.minutes)}m{' '}
                        <span className="text-[#FF8FA8]">{pad(countdown.seconds)}s</span>
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => scrollToSection('booking-card')}
                  className="hidden lg:inline-flex h-10 px-5 rounded-full bg-[#E34060] hover:bg-[#cf3452] text-white text-xs font-black tracking-wide items-center gap-2 transition-colors cursor-pointer font-heading shadow-lg shadow-[#E34060]/30"
                >
                  <Ticket className="w-4 h-4" />
                  Get Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────── Main Layout (redesigned) ───────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-5 min-w-0">
            {/* Section nav: simple underline tabs */}
            <nav
              aria-label="Event sections"
              className="flex items-center gap-6 border-b border-neutral-200 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {navItems.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="shrink-0 -mb-px py-3 text-sm font-semibold text-neutral-600 border-b-2 border-transparent hover:text-[#E34060] hover:border-[#E34060] transition-colors cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </nav>

            {/* About the Event */}
            <section id="about" className={SECTION_CARD}>
              <SectionTitle title="About the Event" />

              <div className="space-y-4 text-[15px] text-neutral-700 leading-7">
                {aboutParagraphs.length > 0 ? (
                  aboutParagraphs.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))
                ) : (
                  <p className="text-neutral-500">Details will be shared soon.</p>
                )}
              </div>

              {/* Plain notice instead of the gradient strip */}
              <div className="mt-5 flex items-center gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-sm text-amber-900">
                <Users className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <span className="font-semibold">High interest event.</span> Limited intimate seating.
                </span>
              </div>
            </section>

            {/* Event Comforts & Features */}
            {hasComforts && (
              <section id="comforts" className={SECTION_CARD}>
                <SectionTitle
                  title="Comforts & Features"
                  subtitle="What to expect at the venue"
                />

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                  {frontendComforts.map((comfort) => (
                    <li key={comfort.id} className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-[#23A2B3]/10 flex items-center justify-center shrink-0">
                        {renderComfortIcon(comfort.iconName)}
                      </span>
                      <span className="text-sm font-medium text-neutral-800 leading-snug">
                        {comfort.label}
                      </span>
                    </li>
                  ))}

                  {hostComforts.map((comfort) => (
                    <li key={`host-${comfort}`} className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-[#23A2B3]/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-[#1B8795]" />
                      </span>
                      <span className="text-sm font-medium text-neutral-800 leading-snug">
                        {comfort}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Location: compact map */}
            <section id="location" className={SECTION_CARD}>
              <SectionTitle title="Location" />

              <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-center">
                {/* Address */}
                <div className="md:col-span-3 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-[#E34060]/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#E34060]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[#231E59] leading-snug">
                        {displayEvent.venue}
                      </p>
                      {displayEvent.locality && (
                        <p className="text-sm text-neutral-600 leading-relaxed mt-0.5">
                          {displayEvent.locality}
                        </p>
                      )}
                      {displayEvent.city && (
                        <p className="text-sm text-neutral-500 mt-0.5">{displayEvent.city}</p>
                      )}
                    </div>
                  </div>

                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#231E59] hover:bg-[#2f2677] text-sm font-semibold text-white transition-colors"
                  >
                    Get Directions
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Small map preview */}
                <div className="md:col-span-2 h-32 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                  <iframe
                    title="Venue Location Preview"
                    loading="lazy"
                    className="w-full h-full border-0"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      `${displayEvent.venue}, ${displayEvent.locality}, ${displayEvent.city}`
                    )}&z=15&output=embed`}
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </section>

            {/* Host */}
            <section id="host" className={SECTION_CARD}>
              <SectionTitle title="Hosted by" />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#231E59] text-white flex items-center justify-center text-lg font-bold font-heading shrink-0">
                  {(displayEvent.host.name || '?').charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-[#231E59] font-heading">
                      {displayEvent.host.name}
                    </h3>
                    {displayEvent.host.verified && (
                      <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Host
                      </span>
                    )}
                  </div>
                  {displayEvent.host.role && (
                    <p className="text-sm text-neutral-500 mt-0.5">{displayEvent.host.role}</p>
                  )}
                  {displayEvent.host.bio && (
                    <p className="text-sm text-neutral-700 leading-6 mt-2">
                      {displayEvent.host.bio}
                    </p>
                  )}
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-3 divide-x divide-neutral-200 rounded-lg border border-neutral-200 bg-neutral-50">
                <div className="py-3 text-center">
                  <dt className="text-xs text-neutral-500 flex items-center justify-center gap-1">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Past editions
                  </dt>
                  <dd className="text-lg font-bold text-[#231E59] font-heading tabular-nums mt-0.5">
                    {displayEvent.host.eventsCount}
                  </dd>
                </div>
                <div className="py-3 text-center">
                  <dt className="text-xs text-neutral-500 flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Followers
                  </dt>
                  <dd className="text-lg font-bold text-[#231E59] font-heading tabular-nums mt-0.5">
                    {(displayEvent.host.followersCount / 1000).toFixed(1)}k
                  </dd>
                </div>
                <div className="py-3 text-center">
                  <dt className="text-xs text-neutral-500 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    Rating
                  </dt>
                  <dd className="text-lg font-bold text-[#231E59] font-heading tabular-nums mt-0.5">
                    {displayEvent.host.rating}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Tags */}
            {displayEvent.tags && displayEvent.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-1">
                {displayEvent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white border border-neutral-200 text-neutral-600 rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 min-w-0">
            <div
              id="booking-card"
              className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden scroll-mt-24"
            >
              {/* Solid header */}
              <div className="bg-[#231E59] text-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs text-white/70 block">Starting from</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-black font-heading tabular-nums leading-none">
                        ₹{selectedTier.price}
                      </span>
                      <span className="text-xs text-white/70">per ticket</span>
                    </div>
                  </div>

                  <span
                    className={`text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      isBookingFull ? "bg-neutral-600" : "bg-[#E34060]"
                    }`}
                  >
                    {isBookingFull ? (
                      "Booking Full"
                    ) : (
                      <>
                        <Flame className="w-3 h-3" />
                        Selling Fast
                      </>
                    )}
                  </span>
                </div>

                {showSeatMeter && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-white/70">Seats filling up</span>
                      <span className="font-semibold tabular-nums">{availableSeats} left</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FF8FA8] transition-all duration-700"
                        style={{ width: `${100 - seatsLeftPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-5">
                {/* Tier Selection */}
                <div>
                  <label className="text-sm font-semibold text-neutral-800 block mb-2">
                    Select ticket
                  </label>
                  <div className="space-y-2">
                    {displayEvent.ticketTiers.map((tier) => {
                      const isSelected = selectedTier.id === tier.id;
                      const disabled = isBookingFull || tier.available <= 0;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => {
                            if (!disabled) setSelectedTier(tier);
                          }}
                          className={`p-3 rounded-lg border transition-colors ${
                            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          } ${
                            isSelected
                              ? 'border-[#E34060] bg-[#E34060]/5 ring-1 ring-[#E34060]'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isSelected ? 'border-[#E34060]' : 'border-neutral-300'
                                }`}
                              >
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-[#E34060]" />
                                )}
                              </span>
                              <span className="text-sm font-semibold text-neutral-900 truncate">
                                {tier.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-[#231E59] tabular-nums">
                              ₹{tier.price}
                            </span>
                          </div>
                          {tier.description && (
                            <p className="text-xs text-neutral-500 mt-1 pl-6.5 ml-0.5 line-clamp-2">
                              {tier.description}
                            </p>
                          )}
                          <p className="text-xs text-neutral-500 mt-1 ml-6">
                            {tier.available} tickets left
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-800">Guests</span>
                    <span className="text-xs text-neutral-500">Max 6 per booking</span>
                  </div>
                  <div className="flex items-center justify-between border border-neutral-200 rounded-lg p-1.5">
                    <button
                      onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                      disabled={isBookingFull || ticketQuantity <= 1}
                      aria-label="Decrease guests"
                      className="w-9 h-9 rounded-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold text-[#231E59] tabular-nums">
                      {ticketQuantity}
                    </span>
                    <button
                      onClick={() => setTicketQuantity(Math.min(maxGuests, ticketQuantity + 1))}
                      disabled={isBookingFull || ticketQuantity >= maxGuests}
                      aria-label="Increase guests"
                      className="w-9 h-9 rounded-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add-Ons */}
                {event.addOns && event.addOns.length > 0 && (
                  <div className="pt-4 border-t border-neutral-100">
                    <label className="text-sm font-semibold text-neutral-800 block mb-2">
                      Add-ons <span className="font-normal text-neutral-500">(optional)</span>
                    </label>
                    <div className="space-y-2">
                      {event.addOns.map((addon) => {
                        const isAdded = selectedAddOnIds.includes(addon.id);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => handleToggleAddOn(addon.id)}
                            className={`p-3 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                              isAdded
                                ? 'bg-[#23A2B3]/5 border-[#23A2B3] ring-1 ring-[#23A2B3]'
                                : 'bg-white border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-neutral-900">{addon.name}</p>
                              <p className="text-xs text-neutral-500 mt-0.5">{addon.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-sm font-bold text-[#231E59] block">
                                +₹{addon.price}
                              </span>
                              <span className="text-xs font-semibold text-[#1B8795]">
                                {isAdded ? 'Added ✓' : 'Add'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price summary */}
                <div className="pt-4 border-t border-neutral-100 text-sm space-y-2">
                  <div className="flex justify-between text-neutral-600">
                    <span>
                      {selectedTier.name} × {ticketQuantity}
                    </span>
                    <span className="font-medium text-neutral-900 tabular-nums">
                      ₹{selectedTier.price * ticketQuantity}
                    </span>
                  </div>
                  {addOnsTotal > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Add-ons ({selectedAddOnIds.length})</span>
                      <span className="font-medium text-neutral-900 tabular-nums">
                        +₹{addOnsTotal}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Convenience &amp; booking protection</span>
                    <span className="font-medium text-emerald-600">Free</span>
                  </div>
                  <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                    <span className="text-base font-bold text-[#231E59]">Total</span>
                    <span className="text-2xl font-black text-[#231E59] tabular-nums font-heading">
                      ₹{subtotal}
                    </span>
                  </div>
                </div>

                {/* Book Now */}
                <button
                  onClick={handleBookNow}
                  disabled={isBookingFull || ticketQuantity > availableSeats}
                  className={`group w-full h-12 rounded-lg text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                    isBookingFull || ticketQuantity > availableSeats
                      ? "bg-neutral-400 cursor-not-allowed"
                      : "bg-[#E34060] hover:bg-[#cf3452] active:scale-[0.99] cursor-pointer"
                  }`}
                >
                  {isBookingFull ? (
                    <span>Booking Full</span>
                  ) : ticketQuantity > availableSeats ? (
                    <span>Only {availableSeats} Seats Available</span>
                  ) : (
                    <>
                      <span>Book Now</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Instant confirmation
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1B8795]" />
                    Secure checkout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────── Mobile sticky booking bar ───────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-neutral-500">
              Total · {ticketQuantity} {ticketQuantity === 1 ? 'guest' : 'guests'}
            </p>
            <p className="text-lg font-black text-[#231E59] font-heading tabular-nums leading-tight">
              ₹{subtotal}
            </p>
          </div>

          <button
            onClick={handleBookNow}
            disabled={
              isBookingFull ||
              ticketQuantity > availableSeats ||
              ticketQuantity > selectedTierAvailable
            }
            className={`h-11 px-6 rounded-lg text-white font-bold text-sm flex items-center gap-2 transition-colors ${
              isBookingFull ||
              ticketQuantity > availableSeats ||
              ticketQuantity > selectedTierAvailable
                ? "bg-neutral-400 cursor-not-allowed"
                : "bg-[#E34060] hover:bg-[#cf3452] cursor-pointer active:scale-95"
            }`}
          >
            <span>{isBookingFull ? "Booking Full" : "Book Now"}</span>
            {!isBookingFull && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};