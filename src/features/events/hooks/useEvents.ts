import { useState, useEffect, useMemo, useCallback } from 'react';
import { EventItem, BookingRecord, EventFilterCriteria, UserAccount } from '../types/event';
import { INITIAL_EVENTS, INITIAL_USER_BOOKINGS, HERO_PROMOS } from '../data/events';
import { eventService } from '../services/eventService';
import { eventApi } from '../services/eventApi';
import { fetchEventPlatformEvents } from "../services/eventApi";

const DEFAULT_FILTER_CRITERIA: EventFilterCriteria = {
  search: '',
  category: 'All',
  city: 'All Cities',
  priceRange: [0, 3000],
  onlySellingFast: false,
  genre: 'All Genres',
  sortBy: 'newest',
  onlyUploadedByMe: false,
};

// type PlatformEvent = Awaited<
//   ReturnType<typeof fetchEventPlatformEvents>
// >[number];
export type PlatformEvent = Awaited<
  ReturnType<typeof fetchEventPlatformEvents>
>[number];

// const mapPlatformEvent = (event: PlatformEvent): EventItem => {
export const mapPlatformEvent = (event: PlatformEvent): EventItem => {
  const start = new Date(event.start_datetime);
  const end = new Date(event.end_datetime);

  const eventLanguages =
  event.language_details?.map((language) => language.name) || [];

  const durationMinutes = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 60000)
  );

  const duration =
    durationMinutes >= 60
      ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60 ? `${durationMinutes % 60}m` : ""}`.trim()
      : `${durationMinutes}m`;

  return {
    id: String(event.id),
    slug: event.slug,
    title: event.title,
    subtitle: event.short_description || "",
    // category: "Events",
    category: event.category_label || 'Uncategorized',
    categoryId: event.category,
    genre: "Live Music",
    tagline: event.short_description || event.title,
    description: event.description || event.short_description || "",
    detailedAbout: event.description
      ? [event.description]
      : [],
    date: start.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    isoDate: event.start_datetime,
    startDatetime: event.start_datetime,
    endDatetime: event.end_datetime,
    status: event.status,
    time: start.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }),
    venue: event.is_online
      ? "Online Event"
      : event.venue_name || "Venue to be announced",
    locality: event.address || "",
    city: event.city || "",
    duration,
    language: eventLanguages.join(", ") || "Not specified",
    languages: eventLanguages,
    price: Number(event.price || 0),
    image: event.cover_image || "",
    coverImage: event.cover_image || undefined,
    interestedCount: 0,
    capacity: event.capacity || 0,
    bookedCount: event.reserved_seats || 0,
    reservedSeats: event.reserved_seats || 0,
    availableSeats: event.available_seats ?? event.capacity ?? 0,
    bookingFull: event.booking_full ?? false,
    tags: [],
    comforts: [],
    ticketTiers: [
      {
        id: "general",
        name: "General Admission",
        price: Number(event.price || 0),
        description: "Event admission",
        perks: [],
        available: event.available_seats ?? event.capacity ?? 0,
      },
    ],
    host: {
      id: String(event.id),
      name: event.host_name || "Event Host",
      avatar: "",
      role: "Event Host",
      bio: "",
      rating: 0,
      eventsCount: 0,
      followersCount: 0,
      verified: false,
    },
    faqs: [],
  };
};

export const useEvents = (currentUser: UserAccount | null) => {
  // const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [promos] = useState(HERO_PROMOS);
  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_USER_BOOKINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedEventId, setSelectedEventId] = useState<string>('kathaipomaa-10');
  const [criteria, setCriteria] = useState<EventFilterCriteria>(DEFAULT_FILTER_CRITERIA);

  // Load from cache or defaults
  useEffect(() => {
    const loadData = async () => {
      try {
        const platformEvents = await fetchEventPlatformEvents();

        setEvents(platformEvents.map(mapPlatformEvent));
      } catch (error) {
        console.error("Failed to load events from Django API:", error);
        setEvents([]);
      }

      try {
        const savedBookings = await eventApi.getBookings();

        if (savedBookings.length > 0) {
          setBookings(savedBookings);
        }
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtered & sorted events list
  const filteredEvents = useMemo(() => {
    return eventService.filterAndSort(events, criteria, currentUser?.email);
  }, [events, criteria, currentUser?.email]);

  const activeEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // Actions
  const updateFilter = useCallback((partial: Partial<EventFilterCriteria>) => {
    setCriteria((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setCriteria(DEFAULT_FILTER_CRITERIA);
  }, []);

  const createEvent = useCallback(async (newEvent: EventItem) => {
    const updated = await eventService.publishEvent(events, newEvent);
    setEvents(updated);
  }, [events]);

  const deleteEvent = useCallback(async (eventId: string) => {
    const updated = await eventService.deleteEvent(events, eventId);
    setEvents(updated);
  }, [events]);

  const bookTicket = useCallback(async (newBooking: BookingRecord) => {
    const res = await eventService.confirmBooking(bookings, events, newBooking);
    setBookings(res.bookings);
    setEvents(res.events);
  }, [bookings, events]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    const updated = bookings.filter((b) => b.id !== bookingId);
    setBookings(updated);
    await eventApi.saveBookings(updated);
  }, [bookings]);

  return {
    events,
    filteredEvents,
    activeEvent,
    selectedEventId,
    setSelectedEventId,
    promos,
    bookings,
    criteria,
    updateFilter,
    resetFilters,
    createEvent,
    deleteEvent,
    bookTicket,
    cancelBooking,
    isLoading,
  };
};
