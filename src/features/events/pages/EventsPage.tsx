import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useEvents } from "../hooks/useEvents";
import { useEventAuth } from "../context/EventAuthContext";

import { HeroSection } from "../components/HeroSection";
import { EventListView } from "../components/EventListView";
import { EventDetailView } from "../components/EventDetailView";
import { TrustCredibilitySection } from "../components/TrustCredibilitySection";
import { PaymentModal } from "../components/PaymentModal";

import { EventModal } from "../components/EventModal";
import { LoginModal } from "../components/LoginModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { Toast, ToastMessage } from "../components/Toast";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

import { createHostEvent, updateHostEvent } from "../services/eventApi";
import type { EventFormPayload } from "../components/EventModal";

import {
  EventItem,
  TicketTier,
  ViewState,
} from "../types/event";

interface PaymentSession {
  isOpen: boolean;
  event?: EventItem;
  tier?: TicketTier;
  quantity: number;
  selectedAddOns: string[];
  addOnsTotal: number;
}

export default function EventsPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { currentUser, onLogin, onLogout } = useEventAuth();
  const {
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
  } = useEvents(currentUser);

  // Router view state
  const [currentView, setCurrentView] = useState<ViewState>('home');
  useEffect(() => {
    if (!slug) {
      setCurrentView('home');
      return;
    }

    const matchingEvent = events.find(
      (event) => event.slug === slug || event.id === slug
    );

    if (matchingEvent) {
      setSelectedEventId(matchingEvent.id);
      setCurrentView('event-detail');
    }
  }, [slug, events, setSelectedEventId]);

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInitialRole, setAuthInitialRole] = useState<'host' | 'attendee'>('host');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'events' | 'bookings' | 'profile'>('events');
  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [paymentSession, setPaymentSession] = useState<PaymentSession>({
    isOpen: false,
    quantity: 1,
    selectedAddOns: [],
    addOnsTotal: 0,
  });

  // A booking the user started while signed out. It is resumed after sign-in.
  const [pendingBooking, setPendingBooking] = useState<PaymentSession | null>(null);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Resume the pending booking once the user is signed in, or drop it if they
  // closed the sign-in window without signing in.
  useEffect(() => {
    if (!pendingBooking) return;

    if (currentUser) {
      setPaymentSession(pendingBooking);
      setPendingBooking(null);
      setIsAuthModalOpen(false);
      return;
    }

    if (isAuthModalOpen) return;

    // Short grace period: the user object can arrive a moment after the
    // sign-in modal closes.
    const timer = setTimeout(() => setPendingBooking(null), 1500);
    return () => clearTimeout(timer);
  }, [currentUser, pendingBooking, isAuthModalOpen]);

  // Navigation Handlers
  const handleSelectEvent = (eventId: string) => {
    const selectedEvent = events.find(
      (event) => event.id === eventId
    );

    if (!selectedEvent) return;

    setSelectedEventId(eventId);
    setCurrentView('event-detail');

    navigate(
      `/events/${encodeURIComponent(selectedEvent.slug || selectedEvent.id)}`
    );

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    navigate('/events');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: string) => {
    updateFilter({ category: Number(cat) });

    if (currentView !== 'home') {
      setCurrentView('home');
      navigate('/events');
    }

    setTimeout(() => {
      const el = document.getElementById('discovery-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleProceedToBooking = (
    event: EventItem,
    tier: TicketTier,
    quantity: number,
    selectedAddOns: string[],
    addOnsTotal: number
  ) => {
    const session: PaymentSession = {
      isOpen: true,
      event,
      tier,
      quantity,
      selectedAddOns,
      addOnsTotal,
    };

    // Signed out: remember the booking, ask the user to sign in, then come
    // straight back to this payment step (see the effect above).
    if (!currentUser) {
      setPendingBooking(session);
      setAuthInitialRole('attendee');
      setIsAuthModalOpen(true);
      addToast({
        type: 'info',
        title: 'Sign in to continue',
        message: "Please sign in to complete your booking. We'll bring you straight back to checkout.",
      });
      return;
    }

    setPaymentSession(session);
  };

  const handlePaymentSuccess = (newBooking: any) => {
    bookTicket(newBooking);
    addToast({
      type: 'success',
      title: 'Pass Confirmed!',
      message: `Your booking for ${newBooking.eventTitle} is confirmed. Digital QR pass created.`,
    });
  };

  const myEventsCount = events.filter((e) => {
    if (!currentUser) return false;
    return e.uploadedBy?.email?.toLowerCase() === currentUser.email?.toLowerCase() || currentUser.role === 'host';
  }).length;

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans selection:bg-[#E34060]/20 selection:text-[#E34060]">
      
      {/* Header with Unified Profile Icon (My Tickets removed from header, everything accessed via Profile Icon) */}
      <Header
        onHomeClick={handleBackToHome}
        onOpenProfile={() => {
          if (currentUser) {
            setProfileInitialTab(currentUser.role === 'host' ? 'events' : 'bookings');
            setIsProfileModalOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        currentUser={currentUser}
        bookingsCount={bookings.length}
        myEventsCount={myEventsCount}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'home' ? (
          <>
            {/* Hero Section */}
            <HeroSection
              events={events}
              promos={promos}
              onSelectEvent={handleSelectEvent}
              onSelectCategoryTab={handleSelectCategory}
            />

            {/* Section 2: Catalog with Category Tabs & Left-side Filters */}
            <EventListView
              events={filteredEvents}
              criteria={criteria}
              onUpdateCriteria={updateFilter}
              onResetCriteria={resetFilters}
              onSelectEvent={handleSelectEvent}
              currentUserEmail={currentUser?.email}
            />

            {/* Credibility & Patron Trust Section (Brand Blue Background before footer) */}
            <TrustCredibilitySection />
          </>
        ) : (
          /* Dedicated Event Detail Page */
          <EventDetailView
            event={activeEvent}
            onBack={handleBackToHome}
            onProceedToBooking={handleProceedToBooking}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenHostPortal={() => {
          if (currentUser?.role === 'host') {
            setProfileInitialTab('events');
            setIsProfileModalOpen(true);
          } else {
            setAuthInitialRole('host');
            setIsAuthModalOpen(true);
          }
        }}
      />

      {/* Payment Gateway Modal */}
      {paymentSession.isOpen && paymentSession.event && paymentSession.tier && (
        <PaymentModal
          event={paymentSession.event}
          tier={paymentSession.tier}
          quantity={paymentSession.quantity}
          selectedAddOns={paymentSession.selectedAddOns}
          addOnsTotal={paymentSession.addOnsTotal}
          onClose={() => setPaymentSession((prev) => ({ ...prev, isOpen: false }))}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Unified Profile Modal (My Events, My Bookings, Profile, OTP Verification details) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        events={events}
        bookings={bookings}
        onOpenAuth={(role) => {
          setIsProfileModalOpen(false);
          setAuthInitialRole(role || 'host');
          setIsAuthModalOpen(true);
        }}
        onOpenCreateEvent={() => {
          setIsProfileModalOpen(false);
          setIsHostModalOpen(true);
        }}
        onSelectEvent={(eventId) => {
          setIsProfileModalOpen(false);
          handleSelectEvent(eventId);
        }}
        onDeleteEvent={(id) => {
          deleteEvent(id);
          addToast({
            type: 'info',
            title: 'Event Removed',
            message: 'The event has been removed from your profile and catalog.',
          });
        }}
        onLogout={() => {
          onLogout();
          setIsProfileModalOpen(false);
          addToast({
            type: 'info',
            title: 'Signed Out',
            message: 'You have been safely signed out.',
          });
        }}
        initialTab={profileInitialTab}
      />

      {/* SaaS Host / Event Upload Modal */}
      {isHostModalOpen && (
        <EventModal
          events={events}
          onClose={() => setIsHostModalOpen(false)}
          onCreateEvent={async (payload) => {
            try {
              await createHostEvent(payload);
            } catch (err) {
              // Rethrow so the modal shows the error in its red box
              // and stays on the form instead of closing.
              throw err;
            }

            addToast({
              type: 'success',
              title: 'Event Submitted!',
              message: `"${payload.title}" was submitted. It will appear on the site once an admin publishes it.`,
            });

            setIsHostModalOpen(false);
          }}
          onUpdateEvent={async (eventId, payload) => {
            await updateHostEvent(eventId, payload);

            addToast({
              type: "success",
              title: "Event Updated!",
              message: `"${payload.title}" was updated successfully.`,
            });

            setIsHostModalOpen(false);
          }}
          onDeleteEvent={(id) => {
            deleteEvent(id);
            addToast({
              type: 'info',
              title: 'Event Removed',
              message: 'The event has been unlisted from the platform.',
            });
          }}
          currentUser={currentUser}
          onOpenAuth={() => {
            setIsHostModalOpen(false);
            setAuthInitialRole('host');
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {/* Login & Organizer Authentication Modal with OTP Verification for Hosts */}
      {isAuthModalOpen && (
        <LoginModal
          currentUser={currentUser}
          onClose={() => setIsAuthModalOpen(false)}
          initialRole={authInitialRole}
          onLogin={(user) => {
            onLogin(user);
            setIsAuthModalOpen(false);
            addToast({
              type: 'success',
              title: `Welcome, ${user.name}!`,
              message: user.role === 'host'
                ? 'Identity verified! You can now access My Events in your profile.'
                : 'Signed in as Ticket Purchaser. Your bookings are ready in your profile.',
            });
            // Automatically open profile so they see their events or bookings
            // (skipped when we are about to resume a pending booking)
            if (!pendingBooking) {
              setProfileInitialTab(user.role === 'host' ? 'events' : 'bookings');
              setIsProfileModalOpen(true);
            }
          }}
          onLogout={() => {
            onLogout();
            addToast({
              type: 'info',
              title: 'Signed Out',
              message: 'You have been safely signed out.',
            });
          }}
        />
      )}

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}