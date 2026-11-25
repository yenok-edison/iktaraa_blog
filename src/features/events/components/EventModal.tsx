import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { EventItem, UserAccount, EventCategory  } from '../types/event';
import {
  PlusCircle,
  ArrowLeft,
  BarChart3,
  X,
  Layers,
  ArrowRight,
  UserCheck,
  IndianRupee,
  Ticket,
  Users,
  Percent,
  Trash2,
  Check,
  ChevronDown,
  AlertCircle,
  Info,
  Calendar,
  MapPin,
  UploadCloud,
  Loader2,
} from 'lucide-react';

import {
  fetchHostEvent,
  fetchMyHostEvents,
  fetchEventLanguages,
  fetchEventCategories,
} from "../services/eventApi";
import { mapPlatformEvent } from "../hooks/useEvents";

// interface EventModalProps {
//   events: EventItem[];
//   onClose: () => void;
//   onCreateEvent: (payload: EventFormPayload) => Promise<void>;
//   onDeleteEvent: (eventId: string) => void;
//   currentUser: UserAccount | null;
//   onOpenAuth: () => void;
// }
interface EventModalProps {
  events: EventItem[];
  onClose: () => void;
  onBack?: () => void;
  onCreateEvent: (payload: EventFormPayload) => Promise<void>;
  onUpdateEvent: (
    eventId: string,
    payload: EventFormPayload
  ) => Promise<void>;
  editingEvent?: EventItem | null;
  onDeleteEvent: (eventId: string) => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
}

/* ───── Constants, types and helpers ───── */

const COVER_OPTIONS = [
  { label: 'Live Concert Stage', url: '/src/assets/images/colorful_live_concert_1794046871091.jpg' },
  { label: 'Story & Coffee Gathering', url: '/src/assets/images/colorful_kaapi_raagam_1794046871357.jpg' },
  { label: 'Instruments & Studio', url: '/src/assets/images/colorful_sound_lab_1794046872579.jpg' },
];

const DEFAULT_COVER = '/src/assets/images/hero_acoustic_live_1794043985230.jpg';
const MAX_COVER_SIZE_MB = 5;
const ALLOWED_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const CITIES = ['Chennai', 'Bengaluru', 'Mumbai', 'Delhi-NCR', 'Hyderabad'];

export interface EventFormPayload {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: number;
  event_type: 'free' | 'paid';
  price: number;
  venue_name: string;
  address: string;
  comforts: string[];
  google_maps_url: string;
  city: string;
  is_online: boolean;
  online_meeting_url: string;
  start_datetime: string; // ISO UTC
  end_datetime: string;
  booking_start: string | null;
  booking_end: string | null;
  capacity: number;
  languages: number[];
  cover_image: File | null;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);

// Use this everywhere a price is shown on your site. It already includes the ₹ sign.
export const formatPrice = (price: number | string) => {
  const n = Number(price);
  return !n ? 'Free' : `₹${n.toLocaleString('en-IN')}`;
};

const urlToFile = async (url: string, name: string) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || 'image/jpeg' });
};

// Format a Date for <input type="datetime-local"> in the user's local time
const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

// text-base on mobile stops iOS from zooming into focused inputs
const CONTROL =
  'w-full h-11 rounded-xl border border-neutral-200 bg-white px-3.5 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-[#231E59] focus:ring-4 focus:ring-[#231E59]/10';

const CARD =
  'rounded-2xl border border-neutral-200 bg-white shadow-[0_4px_16px_rgba(35,30,89,0.05)]';

const PRIMARY_BTN =
  'bg-gradient-to-r from-[#E34060] to-[#C02D6F] text-white shadow-lg shadow-[#E34060]/25 transition active:scale-[0.97]';

/* ───── Building blocks (outside the component so inputs keep focus) ───── */

const Field: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, className = '', children }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-neutral-700">
      <span>
        {label}
        {required && <span className="ml-0.5 text-[#E34060]">*</span>}
      </span>
      {hint && <span className="text-[10px] font-medium text-neutral-400">{hint}</span>}
    </span>
    {children}
  </label>
);

const SelectWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="relative block">
    {children}
    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
  </span>
);

const FormSection: React.FC<{
  index: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ index, title, description, children }) => (
  <section className={`${CARD} p-4 sm:p-5`}>
    <div className="mb-4 flex items-start gap-3 border-b border-neutral-100 pb-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#231E59] text-[11px] font-bold text-white">
        {index}
      </span>
      <div>
        <h4 className="text-sm font-black leading-tight text-[#231E59] font-heading">{title}</h4>
        {description && <p className="mt-0.5 text-[11px] text-neutral-500">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

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
    <div className={`${CARD} p-3 sm:p-4`}>
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

const EventRow = memo(function EventRow({
  
  item,
  isMine,
  confirming,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
  onEdit,
}: {
  item: EventItem;
  isMine: boolean;
  confirming: boolean;
  onAskDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  onEdit: (item: EventItem) => void;
}) {
  const uploaderName = item.uploadedBy?.name || item.host?.name || 'Verified creator';
  const percent =
    item.capacity > 0
      ? Math.min(100, Math.round((item.bookedCount / item.capacity) * 100))
      : 0;

  return (
    <li className={`${CARD} p-3.5 transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(35,30,89,0.09)] sm:p-4`}>
      <div className="flex gap-3.5">
        <img
          src={item.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-16 w-16 shrink-0 rounded-xl border border-neutral-200 object-cover sm:h-20 sm:w-20"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#23A2B3]">
              {item.category || 'Uncategorized'} · {item.city}
            </span>
            {isMine && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Yours
              </span>
            )}
          </div>

          <h5 className="mt-1 line-clamp-1 text-sm font-black text-[#231E59] font-heading">
            {item.title}
          </h5>

          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {item.date}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{item.venue}</span>
            </span>
          </p>
        </div>

        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-base font-black text-[#231E59] tabular-nums font-heading">
            {formatPrice(item.price)}
          </p>
          {Number(item.price) > 0 && <p className="text-[10px] text-neutral-400">per pass</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 border-t border-neutral-100 pt-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-neutral-600">
              {item.bookedCount}/{item.capacity} booked
            </span>
            <span className="font-bold text-[#231E59] tabular-nums">{percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#23A2B3] to-[#E34060] transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <p className="min-w-0 truncate text-[11px] text-neutral-500 sm:flex-1 sm:text-right">
          By <strong className="text-[#231E59]">{uploaderName}</strong>
        </p>

        <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
          <span className="text-base font-black text-[#231E59] tabular-nums font-heading sm:hidden">
            {formatPrice(item.price)}
          </span>

          {confirming ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onConfirmDelete(item.id)}
                className="h-8 cursor-pointer rounded-lg bg-rose-600 px-3 text-[11px] font-bold text-white transition hover:bg-rose-700"
              >
                Yes, remove
              </button>

              <button
                type="button"
                onClick={onCancelDelete}
                className="h-8 cursor-pointer rounded-lg border border-neutral-200 px-3 text-[11px] font-semibold text-neutral-600 transition hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[11px] font-semibold text-neutral-600 transition hover:border-[#23A2B3]/40 hover:bg-[#23A2B3]/10 hover:text-[#15707d]"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => onAskDelete(item.id)}
                aria-label={`Delete ${item.title}`}
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[11px] font-semibold text-neutral-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
});

/* ───── Main component ───── */
export interface EventLanguageItem {
  id: number;
  name: string;
  code: string;
}

// export const EventModal: React.FC<EventModalProps> = ({
  //   events,
  //   onClose,
  //   onCreateEvent,
  //   onDeleteEvent,
  //   currentUser,
  //   onOpenAuth,
  // }) => {
  export const EventModal: React.FC<EventModalProps> = ({
      events,
      onClose,
      onBack,
      onCreateEvent,
      onUpdateEvent,
      editingEvent = null,
      onDeleteEvent,
      currentUser,
      onOpenAuth,
    }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard');
  const [filterOnlyMine, setFilterOnlyMine] = useState(false);
  const [hostEventFilter, setHostEventFilter] = useState<
    'all' | 'published' | 'unpublished'
  >('all');
  const [selectedEditingEvent, setSelectedEditingEvent] =
    useState<EventItem | null>(editingEvent);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hostEvents, setHostEvents] = useState<EventItem[]>([]);
  const [isLoadingHostEvents, setIsLoadingHostEvents] = useState(false);
  const [hostEventsError, setHostEventsError] = useState('');

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  const isEditing = !!selectedEditingEvent;

  // Form state (matches backend fields)
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [availableCategories, setAvailableCategories] = useState<EventCategory[]>([]);
  const [eventType, setEventType] = useState<'free' | 'paid'>('paid');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [onlineMeetingUrl, setOnlineMeetingUrl] = useState('');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Chennai');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');

  const [comforts, setComforts] = useState<string[]>([]);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([]);
  const [availableLanguages, setAvailableLanguages] =
    useState<EventLanguageItem[]>([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'host') {
      setHostEvents([]);
      return;
    }

    let cancelled = false;

    const loadHostEvents = async () => {
      setIsLoadingHostEvents(true);
      setHostEventsError('');

      try {
        // Existing authenticated host endpoint; no API contract changes.
        const platformEvents = await fetchMyHostEvents();
        if (!cancelled) {
          setHostEvents(platformEvents.map(mapPlatformEvent));
        }
      } catch (error) {
        console.error('Failed to load host events:', error);
        if (!cancelled) {
          setHostEventsError(
            error instanceof Error ? error.message : 'Unable to load your events.'
          );
        }
      } finally {
        if (!cancelled) setIsLoadingHostEvents(false);
      }
    };

    loadHostEvents();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.email, currentUser?.role]);

  useEffect(() => {
    let cancelled = false;

    const loadLanguages = async () => {
      try {
        const languages = await fetchEventLanguages();

        if (!cancelled) {
          setAvailableLanguages(languages);
        }
      } catch (error) {
        console.error("Failed to load event languages:", error);

        if (!cancelled) {
          setFormError(
            "Unable to load event languages. Please refresh and try again."
          );
        }
      }
    };

    loadLanguages();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const categories = await fetchEventCategories();
        console.log("Categories API response:", categories);

        if (!cancelled) {
          setAvailableCategories(categories);
        }
      } catch (error) {
        console.error("Failed to load event categories:", error);

        if (!cancelled) {
          setFormError(
            "Unable to load event categories. Please refresh and try again."
          );
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);
  // const [selectedLanguageIds, setSelectedLanguageIds] =
  //   useState<number[]>([]);

  // Cover image
  const [selectedImage, setSelectedImage] = useState(DEFAULT_COVER);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const isLoggedIn = !!currentUser;
  const nowLocal = useMemo(() => toLocalInput(new Date()), []);

  // Escape to close + lock background scroll
  useEffect(() => {
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
  }, [onClose]);

  // Free the temporary preview URL when it changes or the modal closes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleCoverFile = (file: File) => {
    setUploadError('');

    if (!ALLOWED_COVER_TYPES.includes(file.type)) {
      setUploadError('Please upload a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_COVER_SIZE_MB * 1024 * 1024) {
      setUploadError(`The image is too large. Maximum size is ${MAX_COVER_SIZE_MB} MB.`);
      return;
    }

    setCoverFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setPreviewUrl(null);
    setUploadError('');
    setSelectedImage(DEFAULT_COVER);
  };

  const resetForm = () => {
    setTitle('');
    setShortDescription('');
    setDescription('');
    setSelectedCategoryId('');
    setEventType('paid');
    setPrice('');
    setCapacity('');
    setIsOnline(false);
    setOnlineMeetingUrl('');
    setVenueName('');
    setAddress('');
    setCity('Chennai');
    setStartDateTime('');
    setEndDateTime('');
    setBookingStart('');
    setBookingEnd('');
    handleRemoveCover();
    setFormError('');
    setSelectedLanguageIds([]);
    setBookingEnd('');
    setComforts([]);
    setGoogleMapsUrl('');
  };

  useEffect(() => {
    if (!selectedEditingEvent) {
      return;
    }

    let cancelled = false;

    const loadEventForEditing = async () => {
      setActiveTab('create');
      setIsLoadingEdit(true);
      setFormError('');

      try {
        const event = await fetchHostEvent(selectedEditingEvent.id);

        if (cancelled) return;

        setEditingSlug(event.slug);

        setTitle(event.title);
        setShortDescription(event.short_description || '');
        setDescription(event.description || '');

        setEventType(event.event_type);
        setSelectedCategoryId(
          event.category != null ? String(event.category) : ''
        );
        setPrice(
          event.event_type === 'paid'
            ? String(event.price)
            : ''
        );

        setCapacity(String(event.capacity));

        setIsOnline(event.is_online);
        setOnlineMeetingUrl(event.online_meeting_url || '');

        setVenueName(event.venue_name || '');
        setAddress(event.address || '');
        setGoogleMapsUrl(event.google_maps_url || '');
        setComforts(event.comforts || []);
        setCity(event.city || 'Chennai');
        setSelectedLanguageIds(event.languages || []);

        setStartDateTime(
          toLocalInput(new Date(event.start_datetime))
        );

        setEndDateTime(
          toLocalInput(new Date(event.end_datetime))
        );

        setBookingStart(
          event.booking_start
            ? toLocalInput(new Date(event.booking_start))
            : ''
        );

        setBookingEnd(
          event.booking_end
            ? toLocalInput(new Date(event.booking_end))
            : ''
        );
        
        // Keep the existing server image.
        // Do not download it and convert it into a new File.
        setCoverFile(null);
        setPreviewUrl(null);
        setSelectedImage(event.cover_image || DEFAULT_COVER);

      } catch (err) {
        if (!cancelled) {
          setFormError(
            err instanceof Error
              ? err.message
              : 'Could not load this event.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingEdit(false);
        }
      }
    };

    loadEventForEditing();

    return () => {
      cancelled = true;
    };
  }, [selectedEditingEvent?.id]);

  const validateForm = (): string => {
    if (!isLoggedIn) return 'Please log in as a host to submit an event.';
    if (!title.trim()) return 'Event title is required.';
    if (!selectedCategoryId) return 'Please select an event category.';
    if (!description.trim()) return 'Description is required.';
    if (!city.trim()) return 'City is required.';

    if (isOnline) {
      if (!onlineMeetingUrl.trim()) return 'Add the meeting link for an online event.';
    } else if (!venueName.trim()) {
      return 'Venue name is required for in-person events.';
    }

    if (!startDateTime || !endDateTime) return 'Start and end date/time are required.';

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (start <= new Date()) return 'The event must start in the future.';
    if (end <= start) return 'Event end must be after its start.';

    if (bookingStart && new Date(bookingStart) >= start)
      return 'Bookings must open before the event starts.';
    if (bookingEnd && new Date(bookingEnd) > start)
      return 'Bookings must close before the event starts.';
    if (bookingStart && bookingEnd && new Date(bookingEnd) <= new Date(bookingStart))
      return 'Booking close time must be after booking open time.';

    const cap = Number(capacity);
    if (!Number.isInteger(cap) || cap < 1) return 'Capacity must be at least 1.';

    if (eventType === 'paid' && !(Number(price) > 0))
      return 'A paid event needs a price greater than zero.';

    return '';
  };

  const handleEditEvent = useCallback((item: EventItem) => {
    setFormError('');
    setEditingSlug(item.slug || null);
    setSelectedEditingEvent(item);
    setActiveTab('create');
  }, []);

  const handlePublishEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isLoadingEdit) return;

    setFormError('');

    const error = validateForm();

    if (error) {
      setFormError(error);
      return;
    }

    setIsSubmitting(true);

    try {
      let cover: File | null = coverFile;

      // Only create a File from a preset image for a new event.
      // When editing, no replacement file means preserve the current image.
      if (!isEditing && !cover) {
        try {
          cover = await urlToFile(selectedImage, 'cover.jpg');
        } catch {
          cover = null;
        }
      }

      const payload: EventFormPayload = {
        title: title.trim(),

        // Preserve the existing slug when editing.
        slug: isEditing
          ? editingSlug || slugify(title)
          : `${slugify(title)}-${Date.now().toString(36)}`,

        short_description: shortDescription.trim(),
        description: description.trim(),
        category: Number(selectedCategoryId),

        event_type: eventType,
        price: eventType === 'free' ? 0 : Number(price),

        venue_name: isOnline ? '' : venueName.trim(),
        address: address.trim(),
        google_maps_url: googleMapsUrl.trim(),
        comforts: comforts
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
        city: city.trim(),

        is_online: isOnline,
        online_meeting_url: isOnline ? onlineMeetingUrl.trim() : '',

        start_datetime: new Date(startDateTime).toISOString(),
        end_datetime: new Date(endDateTime).toISOString(),

        booking_start: bookingStart
          ? new Date(bookingStart).toISOString()
          : null,

        booking_end: bookingEnd
          ? new Date(bookingEnd).toISOString()
          : null,

        capacity: Number(capacity),
        languages: selectedLanguageIds,
        cover_image: cover,
      };

      if (isEditing && selectedEditingEvent) {
        await onUpdateEvent(selectedEditingEvent.id, payload);
      } else {
        await onCreateEvent(payload);
      }

      resetForm();
      setEditingSlug(null);
      setSelectedEditingEvent(null);
      setActiveTab('dashboard');

    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : isEditing
            ? 'Could not update the event.'
            : 'Could not create the event.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ───── Derived data ───── */

  const ownerEmail = currentUser?.email.toLowerCase() ?? '';

  const visibleEvents = useMemo(() => {
    if (currentUser?.role === 'host') return hostEvents;
    if (!filterOnlyMine || !currentUser) return events;
    return events.filter((item) => item.uploadedBy?.email?.toLowerCase() === ownerEmail);
  }, [events, hostEvents, filterOnlyMine, currentUser, ownerEmail]);

  const stats = useMemo(() => {
    const booked = visibleEvents.reduce((s, e) => s + e.bookedCount, 0);
    const seats = visibleEvents.reduce((s, e) => s + e.capacity, 0);
    const revenue = visibleEvents.reduce((s, e) => s + e.bookedCount * Number(e.price || 0), 0);
    return {
      events: visibleEvents.length,
      booked,
      fill: seats ? Math.round((booked / seats) * 100) : 0,
      revenue,
    };
  }, [visibleEvents]);

  const filteredHostEvents = useMemo(() => {
    if (hostEventFilter === 'published') {
      return visibleEvents.filter((event) => event.status === 'published');
    }

    if (hostEventFilter === 'unpublished') {
      return visibleEvents.filter((event) => event.status !== 'published');
    }

    return visibleEvents;
  }, [visibleEvents, hostEventFilter]);

  const handleConfirmDelete = useCallback(
    (id: string) => {
      onDeleteEvent(id);
      setHostEvents((previous) => previous.filter((item) => item.id !== id));
      setPendingDeleteId(null);
    },
    [onDeleteEvent]
  );
  const handleAskDelete = useCallback((id: string) => setPendingDeleteId(id), []);
  const handleCancelDelete = useCallback(() => setPendingDeleteId(null), []);

  const coverPreview = coverFile && previewUrl ? previewUrl : selectedImage;

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3, accent: 'text-[#23A2B3]' },
    { id: 'create' as const, label: 'Create Event', icon: PlusCircle, accent: 'text-[#E34060]' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0E0B2B]/60 backdrop-blur-sm sm:items-center sm:p-6"
      // Backdrop click closes the dashboard, but never throws away a half-filled form
      onClick={activeTab === 'dashboard' ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Host and organizer portal"
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-neutral-200 bg-[#F6F5FB] shadow-[0_30px_80px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-6 duration-200 motion-reduce:animate-none sm:h-[88vh] sm:max-w-4xl sm:rounded-[28px]"
      >
        {/* ───── Header ───── */}
        <header className="relative shrink-0 bg-white px-4 pb-3 pt-3 sm:px-7 sm:pb-4 sm:pt-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#E34060] to-[#23A2B3]" />

          {/* Drag handle (mobile) */}
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300 sm:hidden" />

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Previous: return to profile"
                  className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-600 transition hover:border-[#23A2B3]/50 hover:bg-[#23A2B3]/5 hover:text-[#231E59]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
              )}
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#E34060] to-[#23A2B3] shadow-md">
                <Layers className="h-5 w-5 text-white" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black leading-tight text-[#231E59] font-heading sm:text-lg">
                  Host &amp; Organizer Portal
                </h3>
                <p className="mt-0.5 hidden truncate text-xs text-neutral-500 sm:block">
                  Create events, track bookings and manage your listings
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="relative z-20 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm ring-1 ring-neutral-200 transition hover:bg-neutral-100 hover:text-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Identity */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  isLoggedIn ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              {currentUser ? (
                <>
                  <span className="font-bold text-[#231E59]">{currentUser.name}</span>
                  <span className="min-w-0 truncate text-neutral-400">{currentUser.email}</span>
                  <span className="rounded-md bg-[#E34060]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#E34060] font-heading">
                    {currentUser.role === 'host' ? 'Host' : 'Attendee'}
                  </span>
                  {currentUser.verifiedHost && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <Check className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </>
              ) : (
                <span className="font-semibold text-rose-600 font-heading">Not logged in</span>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenAuth}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[#23A2B3]/40 bg-white px-3 text-[11px] font-bold text-[#23A2B3] transition hover:bg-[#23A2B3]/10"
            >
              <UserCheck className="h-3.5 w-3.5" />
              {currentUser ? 'Switch account' : 'Log in to upload'}
            </button>
          </div>
        </header>

        {/* ───── Tabs ───── */}
        <div className="shrink-0 border-y border-neutral-200 bg-white px-4 py-2 sm:px-7">
          <div
            role="tablist"
            className="grid grid-cols-2 gap-1 rounded-2xl bg-neutral-100 p-1 sm:inline-grid sm:grid-cols-[repeat(2,auto)]"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-colors font-heading ${
                    active
                      ? 'bg-white text-[#231E59] shadow-sm ring-1 ring-neutral-200'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${tab.accent}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ───── DASHBOARD ───── */}
        {activeTab === 'dashboard' && (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
              <StatCard
                icon={Calendar}
                label="Events"
                value={String(stats.events)}
                tone="bg-[#23A2B3]/10 text-[#23A2B3]"
              />
              <StatCard
                icon={Ticket}
                label="Seats booked"
                value={String(stats.booked)}
                tone="bg-[#E34060]/10 text-[#E34060]"
              />
              <StatCard
                icon={Percent}
                label="Fill rate"
                value={`${stats.fill}%`}
                tone="bg-amber-50 text-amber-600"
              />
              <StatCard
                icon={IndianRupee}
                label="Est. revenue"
                value={`₹${stats.revenue.toLocaleString('en-IN')}`}
                tone="bg-emerald-50 text-emerald-600"
              />
            </div>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h4 className="text-sm font-black uppercase tracking-wider text-[#231E59] font-heading">
                    Events
                    <span className="ml-2 rounded-full bg-[#231E59]/10 px-2 py-0.5 text-[11px] font-bold tabular-nums">
                      {filteredHostEvents.length}
                    </span>
                  </h4>

                  {currentUser && currentUser.role !== 'host' && (
                    <button
                      type="button"
                      onClick={() => setFilterOnlyMine((v) => !v)}
                      aria-pressed={filterOnlyMine}
                      className={`h-7 cursor-pointer rounded-full border px-3 text-[11px] font-semibold transition-colors ${
                        filterOnlyMine
                          ? 'border-[#E34060] bg-[#E34060] text-white'
                          : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      {filterOnlyMine ? 'Showing: mine' : 'Only mine'}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEditingEvent(null);
                    setEditingSlug(null);
                    resetForm();
                    setActiveTab('create');
                  }}
                  className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-xl px-4 text-xs font-bold font-heading ${PRIMARY_BTN}`}
                >
                  <PlusCircle className="h-4 w-4" />
                  New Event
                </button>
              </div>
              {currentUser?.role === 'host' && (
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'all', label: 'All events' },
                    { value: 'published', label: 'Published' },
                    { value: 'unpublished', label: 'Unpublished' },
                  ] as const).map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setHostEventFilter(tab.value)}
                      aria-pressed={hostEventFilter === tab.value}
                      className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                        hostEventFilter === tab.value
                          ? 'border-[#231E59] bg-[#231E59] text-white'
                          : 'border-neutral-300 bg-white text-neutral-600 hover:border-[#231E59]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
              {isLoadingHostEvents && currentUser?.role === 'host' ? (
                <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-10 text-center text-xs text-neutral-500">
                  <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[#23A2B3]" />
                  Loading your events...
                </div>
              ) : hostEventsError && currentUser?.role === 'host' ? (
                <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
                  <p className="text-sm font-bold text-rose-700">Could not load your events</p>
                  <p className="mt-1 text-xs text-rose-600">{hostEventsError}</p>
                  <p className="mt-2 text-[11px] text-rose-600">Close and reopen the dashboard to try again.</p>
                </div>
              ) : filteredHostEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
                  <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#231E59]/10 text-[#231E59]">
                    <Calendar className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-bold text-[#231E59] font-heading">No events to show</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {filterOnlyMine
                      ? "You haven't uploaded any events yet."
                      : 'Create your first event to see it here.'}
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {filteredHostEvents.map((item) => (
                    <EventRow
                      key={item.id}
                      item={item}
                      isMine={
                        !!currentUser && item.uploadedBy?.email?.toLowerCase() === ownerEmail
                      }
                      confirming={pendingDeleteId === item.id}
                      onAskDelete={handleAskDelete}
                      onCancelDelete={handleCancelDelete}
                      onConfirmDelete={handleConfirmDelete}
                      onEdit={handleEditEvent}
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {/* ───── CREATE EVENT ───── */}
        {activeTab === 'create' && (
          <form onSubmit={handlePublishEvent} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7">
              <div className="flex items-start gap-2.5 rounded-xl border border-[#23A2B3]/30 bg-[#23A2B3]/10 p-3 text-xs text-[#15707d]">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {isEditing
                    ? 'Update your event details. Changes will be saved to your existing event.'
                    : 'New events are reviewed by our team before they appear on the site.'}
                </span>
              </div>

              {/* 1. Basic info */}
              <FormSection
                index={1}
                title="Basic information"
                description="What your event is called and how it is described"
              >
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Event title" required>
                    <input
                      type="text"
                      required
                      maxLength={250}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Acoustic Guitar Masterclass"
                      className={CONTROL}
                    />
                  </Field>

                  <Field label="Event category" required>
                    <SelectWrap>
                      <select
                        required
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className={`${CONTROL} appearance-none pr-10`}
                      >
                        <option value="">Select a category</option>

                        {availableCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.label || category.name}
                          </option>
                        ))}
                      </select>
                    </SelectWrap>

                    {availableCategories.length === 0 && (
                      <p className="mt-1.5 text-[11px] text-neutral-500">
                        No categories are currently available.
                      </p>
                    )}
                  </Field>

                  <Field label="Short description" hint={`${shortDescription.length}/300`}>
                    <input
                      type="text"
                      maxLength={300}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="One sentence shown on the event card"
                      className={CONTROL}
                    />
                  </Field>

                  <Field label="Full description" required>
                    <textarea
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell attendees what to expect"
                      className={`${CONTROL} h-auto resize-y py-3`}
                    />
                  </Field>
                </div>
              </FormSection>

              {/* 2. Schedule & venue */}
              <FormSection
                index={2}
                title="Schedule & venue"
                description="When and where it happens"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Event starts" required>
                    <input
                      type="datetime-local"
                      required
                      min={nowLocal}
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      className={CONTROL}
                    />
                  </Field>

                  <Field label="Event ends" required>
                    <input
                      type="datetime-local"
                      required
                      min={startDateTime || nowLocal}
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                      className={CONTROL}
                    />
                  </Field>

                  <Field label="Bookings open" hint="Optional · blank = open now">
                    <input
                      type="datetime-local"
                      value={bookingStart}
                      onChange={(e) => setBookingStart(e.target.value)}
                      className={CONTROL}
                    />
                  </Field>

                  <Field label="Bookings close" hint="Optional · before start">
                    <input
                      type="datetime-local"
                      max={startDateTime || undefined}
                      value={bookingEnd}
                      onChange={(e) => setBookingEnd(e.target.value)}
                      className={CONTROL}
                    />
                  </Field>
                  
                  <Field
                    label="Google Maps link"
                    hint="Optional · for in-person events"
                    className="sm:col-span-2"
                  >
                    <input
                      type="url"
                      value={googleMapsUrl}
                      onChange={(e) => setGoogleMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className={CONTROL}
                    />
                    <p className="mt-1.5 text-[11px] text-neutral-500">
                      Paste the Google Maps share link so attendees can easily find your venue.
                    </p>
                  </Field>

                  {/* <Field
                    label="Event comforts & features"
                    hint="Select all that apply"
                    className="sm:col-span-2"
                  >
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {[
                        'Free Parking',
                        'Snacks',
                        'Drinking Water',
                        'Wi-Fi',
                        'Air Conditioning',
                      ].map((comfort) => {
                        const selected = comforts.includes(comfort);

                        return (
                          <label
                            key={comfort}
                            className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
                              selected
                                ? 'border-[#E34060]/50 bg-rose-50 text-[#231E59]'
                                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(e) => {
                                setComforts((previous) =>
                                  e.target.checked
                                    ? [...previous, comfort]
                                    : previous.filter((item) => item !== comfort)
                                );
                              }}
                              className="h-4 w-4 shrink-0 accent-[#E34060]"
                            />

                            <span className="flex-1">{comfort}</span>

                            {selected && (
                              <Check className="h-4 w-4 shrink-0 text-[#E34060]" />
                            )}
                          </label>
                        );
                      })}
                    </div>

                    <p className="mt-1.5 text-[11px] text-neutral-500">
                      These features will be displayed on your public event page.
                    </p>
                  </Field> */}

                  <Field
                    label="Event comforts & features"
                    hint="Add the facilities available at your event"
                    className="sm:col-span-2"
                  >
                    <div className="space-y-3">
                      {comforts.map((comfort, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={comfort}
                            onChange={(e) => {
                              const value = e.target.value;

                              setComforts((previous) =>
                                previous.map((item, itemIndex) =>
                                  itemIndex === index ? value : item
                                )
                              );
                            }}
                            placeholder="e.g. Car parking"
                            maxLength={100}
                            className={CONTROL}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setComforts((previous) =>
                                previous.filter((_, itemIndex) => itemIndex !== index)
                              )
                            }
                            aria-label={`Remove feature ${index + 1}`}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                          >
                            <span className="text-xl font-bold">−</span>
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => setComforts((previous) => [...previous, ""])}
                        className="flex h-10 items-center gap-2 rounded-xl border border-dashed border-[#E34060] px-4 text-xs font-bold text-[#E34060] transition hover:bg-rose-50"
                      >
                        <span className="text-lg">+</span>
                        Add feature
                      </button>
                    </div>

                    <p className="mt-2 text-[11px] text-neutral-500">
                      Mention facilities available to attendees, such as car parking,
                      drinking water, Wi-Fi or snacks.
                    </p>
                  </Field>



                  {/* Online switch */}
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 sm:col-span-2">
                    <div>
                      <p className="text-sm font-semibold text-[#231E59]">Online event</p>
                      <p className="text-[11px] text-neutral-500">
                        Attendees join through a meeting link
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isOnline}
                      onClick={() => setIsOnline((v) => !v)}
                      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                        isOnline ? 'bg-[#E34060]' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          isOnline ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {isOnline ? (
                    <Field
                      label="Meeting link"
                      required
                      className="sm:col-span-2"
                      hint="Only booked attendees and you can see this"
                    >
                      <input
                        type="url"
                        value={onlineMeetingUrl}
                        onChange={(e) => setOnlineMeetingUrl(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className={CONTROL}
                      />
                    </Field>
                  ) : (
                    <>
                      <Field label="Venue name" required>
                        <input
                          type="text"
                          maxLength={200}
                          value={venueName}
                          onChange={(e) => setVenueName(e.target.value)}
                          placeholder="e.g. Iktaraa Cultural Centre"
                          className={CONTROL}
                        />
                      </Field>

                      <Field label="Address">
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Street, area"
                          className={CONTROL}
                        />
                      </Field>
                    </>
                  )}

                  <Field label="City" required>
                    <SelectWrap>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={`${CONTROL} appearance-none pr-10 font-semibold`}
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </SelectWrap>
                  </Field>

                  <Field
                    label="Event languages"
                    hint="Select all languages used in this event"
                    className="sm:col-span-2"
                  >
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {availableLanguages.map((language) => {
                        const selected = selectedLanguageIds.includes(language.id);

                        return (
                          <label
                            key={language.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                              selected
                                ? "border-[#E34060] bg-rose-50 text-[#231E59]"
                                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(e) => {
                                setSelectedLanguageIds((current) =>
                                  e.target.checked
                                    ? [...current, language.id]
                                    : current.filter((id) => id !== language.id)
                                );
                              }}
                              className="accent-[#E34060]"
                            />
                            <span className="font-medium">{language.name}</span>
                          </label>
                        );
                      })}
                    </div>

                    {availableLanguages.length === 0 && (
                      <p className="text-xs text-neutral-500">
                        No languages are currently available.
                      </p>
                    )}
                  </Field>
                </div>
              </FormSection>

              {/* 3. Pricing & capacity */}
              <FormSection
                index={3}
                title="Pricing & capacity"
                description="Free or paid, and number of seats"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                      Ticket type <span className="text-[#E34060]">*</span>
                    </span>
                    <div className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
                      {(['free', 'paid'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setEventType(type);
                            if (type === 'free') setPrice('');
                          }}
                          className={`h-10 cursor-pointer rounded-lg text-xs font-bold transition-colors font-heading ${
                            eventType === type
                              ? 'bg-white text-[#231E59] shadow-sm ring-1 ring-neutral-200'
                              : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          {type === 'free' ? 'Free event' : 'Paid event'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {eventType === 'paid' && (
                    <Field label="Ticket price (₹)" required>
                      <span className="relative block">
                        <IndianRupee className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="number"
                          min={1}
                          step="0.01"
                          inputMode="decimal"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g. 500"
                          className={`${CONTROL} pl-10 font-bold tabular-nums`}
                        />
                      </span>
                    </Field>
                  )}

                  <Field
                    label="Capacity (seats)"
                    required
                    className={eventType === 'free' ? 'sm:col-span-2' : ''}
                  >
                    <span className="relative block">
                      <Users className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="number"
                        required
                        min={1}
                        inputMode="numeric"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder="e.g. 20"
                        className={`${CONTROL} pl-10 font-bold tabular-nums`}
                      />
                    </span>
                  </Field>
                </div>
              </FormSection>

              {/* 4. Cover image */}
              <FormSection
                index={4}
                title="Cover image"
                description="Upload your own image or pick a preset"
              >
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleCoverFile(file);
                    }}
                    className={`rounded-xl border-2 border-dashed p-3 transition-colors ${
                      isDragging
                        ? 'border-[#E34060] bg-[#E34060]/5'
                        : 'border-neutral-300 bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-[5.5rem] shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="h-full w-full object-cover"
                        />
                        {coverFile && (
                          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {coverFile ? (
                          <>
                            <p className="truncate text-xs font-bold text-[#231E59]">
                              {coverFile.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-neutral-500">
                              {(coverFile.size / 1024 / 1024).toFixed(2)} MB ·{' '}
                              {coverFile.type.replace('image/', '').toUpperCase()}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-[#231E59]">
                              Drag &amp; drop or browse
                            </p>
                            <p className="mt-0.5 text-[11px] text-neutral-500">
                              JPG, PNG or WebP · up to {MAX_COVER_SIZE_MB} MB
                            </p>
                          </>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-[#231E59] px-3 text-xs font-bold text-white transition hover:bg-[#2f2677]">
                          <UploadCloud className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">
                            {coverFile ? 'Replace' : 'Browse'}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleCoverFile(file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        {coverFile && (
                          <button
                            type="button"
                            onClick={handleRemoveCover}
                            aria-label="Remove uploaded image"
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {uploadError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* <div>
                    <div className="mb-3 flex items-center gap-3">
                      <span className="h-px flex-1 bg-neutral-200" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Or choose a preset
                      </span>
                      <span className="h-px flex-1 bg-neutral-200" />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {COVER_OPTIONS.map((opt) => {
                        const selected = !coverFile && selectedImage === opt.url;
                        return (
                          <button
                            key={opt.url}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => {
                              handleRemoveCover();
                              setSelectedImage(opt.url);
                            }}
                            className={`group relative aspect-[16/10] cursor-pointer overflow-hidden rounded-xl border-2 transition-colors ${
                              selected
                                ? 'border-[#E34060] ring-4 ring-[#E34060]/15'
                                : 'border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <img
                              src={opt.url}
                              alt={opt.label}
                              loading="lazy"
                              decoding="async"
                              className={`h-full w-full object-cover transition-opacity ${
                                selected ? '' : 'opacity-80 group-hover:opacity-100'
                              }`}
                            />
                            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <span className="absolute bottom-1.5 left-2 right-2 truncate text-left text-[10px] font-bold leading-tight text-white">
                              {opt.label}
                            </span>
                            {selected && (
                              <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E34060] text-white shadow-md">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div> */}
                </div>
              </FormSection>
            </div>

            {/* Pinned footer */}
            <div className="shrink-0 space-y-3 border-t border-neutral-200 bg-white px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3.5 sm:px-7">
              {!isLoggedIn && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Log in as an approved host to submit this event.</span>
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setEditingSlug(null);
                    setSelectedEditingEvent(null);
                    setActiveTab('dashboard');
                  }}
                  disabled={isSubmitting}
                  className="h-11 cursor-pointer rounded-xl border border-neutral-200 px-5 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50 font-heading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isLoggedIn}
                  className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-xs font-black disabled:cursor-not-allowed disabled:opacity-50 font-heading ${PRIMARY_BTN}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEditing ? 'Saving changes...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Save Changes' : 'Submit Event for Review'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};