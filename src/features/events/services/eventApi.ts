
import { EventItem, BookingRecord, EventCategory } from "../types/event";
import { INITIAL_EVENTS, INITIAL_USER_BOOKINGS } from "../data/events";

const EVENTS_CACHE_KEY = "events_catalog";
const BOOKINGS_CACHE_KEY = "user_bookings";

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      return fallback;
    }

    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
}

export const eventApi = {
  getEvents: async (): Promise<EventItem[]> => {
    return getFromStorage(EVENTS_CACHE_KEY, INITIAL_EVENTS);
  },

  saveEvents: async (events: EventItem[]): Promise<boolean> => {
    return saveToStorage(EVENTS_CACHE_KEY, events);
  },

  getBookings: async (): Promise<BookingRecord[]> => {
    return getFromStorage(BOOKINGS_CACHE_KEY, INITIAL_USER_BOOKINGS);
  },

  saveBookings: async (bookings: BookingRecord[]): Promise<boolean> => {
    return saveToStorage(BOOKINGS_CACHE_KEY, bookings);
  },
};


// ============================================================
// DJANGO EVENT PLATFORM API
// ============================================================

const EVENT_PLATFORM_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "") + "/api/event-platform";


export interface EventLanguageItem {
  id: number;
  name: string;
  code: string;
}

// Fetch active languages for the event form.
export async function fetchEventLanguages(): Promise<EventLanguageItem[]> {
  return eventPlatformRequest<EventLanguageItem[]>(
    "/event-languages/",
    {
      method: "GET",
    },
    false // Public endpoint; no login required.
  );
}

export async function fetchEventCategories(): Promise<EventCategory[]> {
  const response = await eventPlatformRequest<{
    count: number;
    next: string | null;
    previous: string | null;
    results: EventCategory[];
  }>(
    "/categories/",
    {
      method: "GET",
    },
    false
  );

  return response.results;
}


export interface EventPlatformItem {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: number;
  category_label: string | null;
  category_slug: string | null;
  languages?: number[];
  language_details?: EventLanguageItem[];
  event_type: "free" | "paid";
  price: string | number;
  venue_name: string;
  address: string;
  city: string;
  google_maps_url: string;
  comforts: string[];
  is_online: boolean;
  online_meeting_url: string | null;
  start_datetime: string;
  end_datetime: string;
  booking_start: string | null;
  booking_end: string | null;
  capacity: number;
  reserved_seats: number;
  available_seats: number;
  booking_full: boolean;
  status: string;
  cover_image: string | null;
  host_name: string;
  created_at: string;
}


export interface EventAttendeeInput {
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
}


export interface CreateEventBookingInput {
  event_id: number;
  booking_type: "individual" | "group";
  quantity: number;
  attendees: EventAttendeeInput[];
}


export interface CreateEventBookingResponse {
  message: string;
  booking_reference: string;
  event_title: string;
  booking_type: "individual" | "group";
  quantity: number;
  total_amount: string;
  status: "pending" | "confirmed";
  payment_required: boolean;
  expires_at: string | null;
  tickets: {
    ticket_number: string;
    attendee_name: string;
    attendee_email: string;
  }[];
}


export interface RazorpayOrderResponse {
  key_id: string;
  order_id: string;
  amount: number;
  currency: "INR";
  booking_reference: string;
  event_title: string;
}


export interface VerifyRazorpayPaymentInput {
  booking_reference: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}


export interface VerifyRazorpayPaymentResponse {
  message: string;
  booking_reference: string;
  status: string;
  payment_status?: string;
}

export class EventPlatformApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "EventPlatformApiError";
    this.status = status;
    this.data = data;
  }
}



async function eventPlatformRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = true
): Promise<T> {

  const token = localStorage.getItem("iktaraa_reader_token");

  if (requiresAuth && !token) {
    throw new Error("Please sign in to continue.");
  }

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    Accept: "application/json",

    // Let the browser set the multipart boundary for FormData.
    ...(!isFormData
      ? { "Content-Type": "application/json" }
      : {}),

    ...(token && requiresAuth
      ? { Authorization: `Token ${token}` }
      : {}),

    ...options.headers,
  };

  const response = await fetch(
    `${EVENT_PLATFORM_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    let errorData: unknown = null;

    try {
      errorData = await response.json();

      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "detail" in errorData &&
        typeof errorData.detail === "string"
      ) {
        message = errorData.detail;
      } else {
        message = JSON.stringify(errorData);
      }
    } catch {
      // Keep the default error message.
    }

    throw new EventPlatformApiError(
      message,
      response.status,
      errorData
    );
  }

  return response.json() as Promise<T>;
}




// Fetch published events from the new Event Platform.
export async function fetchEventPlatformEvents():
  Promise<EventPlatformItem[]> {

  const response = await fetch(
    `${EVENT_PLATFORM_URL}/`
  );

  if (!response.ok) {
    throw new Error("Unable to fetch events.");
  }

  const data = await response.json();

  return Array.isArray(data) ? data : data.results || [];
}


export async function fetchMyHostEvents():
  Promise<EventPlatformItem[]> {

  const token = localStorage.getItem("iktaraa_reader_token");

  const response = await fetch(
    `${EVENT_PLATFORM_URL}/host/manage/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch your hosted events.");
  }

  const data = await response.json();

  return Array.isArray(data) ? data : data.results || [];
}



// Create an individual or group booking.
export async function createEventBooking(
  bookingData: CreateEventBookingInput
): Promise<CreateEventBookingResponse> {

  return eventPlatformRequest<CreateEventBookingResponse>(
    "/bookings/create/",
    {
      method: "POST",
      body: JSON.stringify(bookingData),
    }
  );
}


// Create a Razorpay payment order.
export async function createRazorpayOrder(
  bookingReference: string
): Promise<RazorpayOrderResponse> {

  return eventPlatformRequest<RazorpayOrderResponse>(
    "/payments/create-order/",
    {
      method: "POST",
      body: JSON.stringify({
        booking_reference: bookingReference,
      }),
    }
  );
}


// Verify a completed Razorpay payment.
export async function verifyRazorpayPayment(
  paymentData: VerifyRazorpayPaymentInput
): Promise<VerifyRazorpayPaymentResponse> {

  return eventPlatformRequest<VerifyRazorpayPaymentResponse>(
    "/payments/verify/",
    {
      method: "POST",
      body: JSON.stringify(paymentData),
    }
  );
}



// ============================================================
// DJANGO EVENT HOST PROFILE API
// ============================================================

export interface EventHostProfileResponse {
  id: number;
  organization: string;
  bio: string;
  city: string;
  is_verified: boolean;
  is_approved: boolean;
}

export async function fetchEventHostProfile():
  Promise<EventHostProfileResponse> {

  return eventPlatformRequest<EventHostProfileResponse>(
    "/host/me/",
    {
      method: "GET",
    }
  );
}


export interface EventHostApplicationInput {
    organization: string;
    bio: string;
    city: string;
}

export async function applyForEventHost(
    application: EventHostApplicationInput
): Promise<EventHostProfileResponse> {
    return eventPlatformRequest<EventHostProfileResponse>(
        "/host/apply/",
        {
            method: "POST",
            body: JSON.stringify(application),
        }
    );
}

export async function fetchEventPlatformEvent(
  slug: string
): Promise<EventPlatformItem> {
  return eventPlatformRequest<EventPlatformItem>(
    `/${encodeURIComponent(slug)}/`,
    {
      method: "GET",
    },
    false
  );
}


// ============================================================
// HOST EVENT CREATION (multipart upload)
// ============================================================

import type { EventFormPayload } from "../components/EventModal";

// Flattens DRF errors like { title: ["This field is required."] } into one message.
function flattenApiError(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;

  const record = data as Record<string, unknown>;

  if (typeof record.detail === "string") return record.detail;

  const parts = Object.entries(record).flatMap(([field, value]) => {
    const messages = Array.isArray(value) ? value : [value];
    return messages.map((m) => `${field}: ${String(m)}`);
  });

  return parts.length ? parts.join(" ") : fallback;
}

export async function createHostEvent(
  payload: EventFormPayload
): Promise<EventPlatformItem> {
  const token = localStorage.getItem("iktaraa_reader_token");

  if (!token) {
    throw new Error("Please sign in to continue.");
  }

  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("slug", payload.slug);
  formData.append("short_description", payload.short_description);
  formData.append("description", payload.description);
  if ("category" in payload && payload.category != null) {
    formData.append("category", String(payload.category));
  }
  formData.append("event_type", payload.event_type);
  formData.append("price", String(payload.price));
  formData.append("venue_name", payload.venue_name);
  formData.append("address", payload.address);
  formData.append("city", payload.city);
  formData.append("google_maps_url", payload.google_maps_url);
  formData.append("comforts", JSON.stringify(payload.comforts));
  formData.append("is_online", String(payload.is_online));
  formData.append("online_meeting_url", payload.online_meeting_url);
  formData.append("start_datetime", payload.start_datetime);
  formData.append("end_datetime", payload.end_datetime);
  formData.append("capacity", String(payload.capacity));

  payload.languages.forEach((languageId) => {
    formData.append("languages", String(languageId));
  });

  if (payload.booking_start) {
    formData.append("booking_start", payload.booking_start);
  }
  if (payload.booking_end) {
    formData.append("booking_end", payload.booking_end);
  }
  if (payload.cover_image) {
    formData.append("cover_image", payload.cover_image);
  }

  const response = await fetch(`${EVENT_PLATFORM_URL}/host/manage/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Token ${token}`,
      // No Content-Type here. The browser sets it for FormData.
    },
    body: formData,
  });

  if (!response.ok) {
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // Keep the fallback message.
    }

    throw new EventPlatformApiError(
      flattenApiError(data, `Could not create the event (${response.status}).`),
      response.status,
      data
    );
  }

  return response.json() as Promise<EventPlatformItem>;
}


// ============================================================
// HOST EVENT EDITING
// ============================================================

// Retrieve one of the authenticated host's own events.
export async function fetchHostEvent(
  eventId: string | number
): Promise<EventPlatformItem> {
  return eventPlatformRequest<EventPlatformItem>(
    `/host/manage/${eventId}/`,
    {
      method: "GET",
    }
  );
}


// Update one of the authenticated host's own events.
// PATCH allows unchanged fields to be omitted.
export async function updateHostEvent(
  eventId: string | number,
  payload: EventFormPayload
): Promise<EventPlatformItem> {
  const token = localStorage.getItem("iktaraa_reader_token");

  if (!token) {
    throw new Error("Please sign in to continue.");
  }

  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("slug", payload.slug);
  formData.append("short_description", payload.short_description);
  formData.append("description", payload.description);
  formData.append("event_type", payload.event_type);
  formData.append("price", String(payload.price));
  formData.append("venue_name", payload.venue_name);
  formData.append("address", payload.address);
  formData.append("city", payload.city);
  formData.append("google_maps_url", payload.google_maps_url);
  formData.append("comforts", JSON.stringify(payload.comforts));
  formData.append("is_online", String(payload.is_online));
  formData.append("online_meeting_url", payload.online_meeting_url);
  formData.append("start_datetime", payload.start_datetime);
  formData.append("end_datetime", payload.end_datetime);
  formData.append("capacity", String(payload.capacity));

  if (payload.languages.length > 0) {
    payload.languages.forEach((languageId) => {
      formData.append("languages", String(languageId));
    });
  } else {
    formData.append("languages", "");
  }

  if (payload.booking_start) {
    formData.append("booking_start", payload.booking_start);
  }

  if (payload.booking_end) {
    formData.append("booking_end", payload.booking_end);
  }

  if (payload.cover_image) {
    formData.append("cover_image", payload.cover_image);
  }

  // Include the category when the form payload contains it.
  if ("category" in payload && payload.category != null) {
    formData.append("category", String(payload.category));
  }

  const response = await fetch(
    `${EVENT_PLATFORM_URL}/host/manage/${eventId}/`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${token}`,
        // Do not set Content-Type for FormData.
      },
      body: formData,
    }
  );

  if (!response.ok) {
    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      // Keep the fallback message.
    }

    throw new EventPlatformApiError(
      flattenApiError(
        data,
        `Could not update the event (${response.status}).`
      ),
      response.status,
      data
    );
  }

  return response.json() as Promise<EventPlatformItem>;
}