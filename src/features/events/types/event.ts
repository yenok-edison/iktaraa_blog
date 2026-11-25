// export type EventCategory = 'Events' | 'Workshops' | 'Music Studio' | 'Jam Sessions';

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  perks: string[];
  available: number;
}

export interface EventCategory {
  id: number;
  name: string;
  slug: string;
  label: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface ComfortFeature {
  id: string;
  iconName: string;
  label: string;
  description?: string;
}

export interface HostProfile {
  id: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
  rating: number;
  eventsCount: number;
  followersCount: number;
  verified: boolean;
}

export interface EventUploader {
  id: string;
  name: string;
  email: string;
  role: string;
  timestamp?: number;
}

export interface EventItem {
  id: string;
  slug?: string;
  title: string;
  nativeTitle?: string;
  subtitle: string;
  category: string;
  categoryId?: number;
  genre: string;
  tagline: string;
  description: string;
  detailedAbout: string[];
  date: string;
  isoDate: string;
  time: string;
  venue: string;
  startDatetime?: string;
  endDatetime?: string;
  status?: string;
  locality: string;
  city: string;
  mapCoordinates?: { lat: number; lng: number };
  duration: string;
  language: string;
  languages?: string[];
  price: number;
  originalPrice?: number;
  image: string;
  coverImage?: string;
  audioSampleUrl?: string;
  audioSampleTitle?: string;
  isSellingFast?: boolean;
  isRecommended?: boolean;
  interestedCount: number;
  capacity: number;
  bookedCount: number;
  reservedSeats?: number;
  availableSeats?: number;
  bookingFull?: boolean;
  tags: string[];
  comforts: ComfortFeature[];
  comfortsFromHost?: string[];
  google_maps_url?: string;
  ticketTiers: TicketTier[];
  host: HostProfile;
  uploadedBy?: EventUploader;
  addOns?: AddOn[];
  faqs: { question: string; answer: string }[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'host' | 'attendee'; // 'host' = Event creator / host, 'attendee' = User / ticket purchaser
  avatar?: string;
  organization?: string;
  bio?: string;
  city?: string;
  verifiedHost?: boolean;
  otpVerifiedAt?: string;
  createdAt: string;
}

export interface HeroPromoCard {
  id: string;
  title: string;
  highlightText: string;
  subtitle: string;
  validity: string;
  ctaText: string;
  actionType: 'event' | 'promo' | 'link';
  targetEventId?: string;
  targetUrl?: string;
  promoCode?: string;
  discountBadge?: string;
  image: string;
  brandName?: string;
  category: 'trending' | 'promotions' | 'specials';
  bgGradient?: string;
}

export interface BookingRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  nativeTitle?: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  city: string;
  image: string;
  tierId: string;
  tierName: string;
  unitPrice: number;
  quantity: number;
  addOnsTotal: number;
  selectedAddOns: string[];
  convenienceFee: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Razorpay' | 'Free';
  paymentId: string;
  bookingTimestamp: number;
  status: 'confirmed' | 'cancelled';
  qrCodeSeed: string;
}

export interface EventFilterCriteria {
  search: string;
  // category: string;
  category?: number | 'All';
  city: string;
  priceRange: [number, number];
  onlySellingFast: boolean;
  genre: string;
  sortBy: 'newest' | 'most-liked' | 'most-viewed' | 'oldest' | 'recommended' | 'price-low' | 'price-high' | 'date-soon';
  onlyUploadedByMe?: boolean;
}

export type ViewState = 'home' | 'event-detail' | 'host-portal' | 'user-profile';
