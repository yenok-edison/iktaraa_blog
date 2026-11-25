import { EventItem, EventFilterCriteria, BookingRecord } from '../types/event';
import { eventApi } from './eventApi';
import { eventAdapter } from './eventAdapter';

export const eventService = {
  fetchCatalog: async (): Promise<EventItem[]> => {
    return eventApi.getEvents();
  },

  filterAndSort: (
    events: EventItem[],
    criteria: EventFilterCriteria,
    currentUserEmail?: string
  ): EventItem[] => {
    const filtered = events.filter((e) =>
      eventAdapter.matchesFilter(e, criteria, currentUserEmail)
    );
    return eventAdapter.sortEvents(filtered, criteria.sortBy);
  },

  calculateBookingTotal: (
    unitPrice: number,
    quantity: number,
    addOnsTotal: number
  ) => {
    const subtotal = unitPrice * quantity + addOnsTotal;
    const convenienceFee = Math.round(subtotal * 0.035);
    const total = subtotal + convenienceFee;
    return { subtotal, convenienceFee, total };
  },

  publishEvent: async (
    allEvents: EventItem[],
    newEvent: EventItem
  ): Promise<EventItem[]> => {
    const updated = [newEvent, ...allEvents];
    await eventApi.saveEvents(updated);
    return updated;
  },

  deleteEvent: async (
    allEvents: EventItem[],
    eventId: string
  ): Promise<EventItem[]> => {
    const updated = allEvents.filter((e) => e.id !== eventId);
    await eventApi.saveEvents(updated);
    return updated;
  },

  confirmBooking: async (
    allBookings: BookingRecord[],
    allEvents: EventItem[],
    newBooking: BookingRecord
  ): Promise<{ bookings: BookingRecord[]; events: EventItem[] }> => {
    const updatedBookings = [newBooking, ...allBookings];
    const updatedEvents = allEvents.map((ev) =>
      ev.id === newBooking.eventId
        ? {
          ...ev,
          bookedCount: ev.bookedCount + newBooking.quantity,
          reservedSeats: (ev.reservedSeats ?? ev.bookedCount) + newBooking.quantity,
          availableSeats: Math.max(
            0,
            (ev.availableSeats ?? ev.capacity) - newBooking.quantity
          ),
          bookingFull:
            Math.max(
              0,
              (ev.availableSeats ?? ev.capacity) - newBooking.quantity
            ) === 0,
        }
        : ev
    );

    await Promise.all([
      eventApi.saveBookings(updatedBookings),
      eventApi.saveEvents(updatedEvents),
    ]);

    return { bookings: updatedBookings, events: updatedEvents };
  },
};
