import React, { useState, useEffect } from 'react';
import { EventItem, TicketTier, BookingRecord } from '../types/event';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  Wallet,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Ticket,
  Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  createEventBooking,
  createRazorpayOrder,
  verifyRazorpayPayment,
  EventPlatformApiError
} from "../services/eventApi";

import type {
  CreateEventBookingInput,
  EventAttendeeInput,
  VerifyRazorpayPaymentInput,
} from "../services/eventApi";

import { useAuth } from "../../../shared/auth/AuthContext";

/* ─────────────────────────────────────────────────────────────
 * Razorpay typings & loader (unchanged)
 * ───────────────────────────────────────────────────────────── */

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayCheckoutOptions
    ) => {
      open: () => void;
    };
  }
}

const loadRazorpayCheckout = async (): Promise<void> => {
  if (window.Razorpay) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve();

    script.onerror = () =>
      reject(new Error("Unable to load Razorpay Checkout. Please try again."));

    document.body.appendChild(script);
  });
};

/* ─────────────────────────────────────────────────────────────
 * Props
 * ───────────────────────────────────────────────────────────── */

interface PaymentModalProps {
  event: EventItem;
  tier: TicketTier;
  quantity: number;
  selectedAddOns: string[];
  addOnsTotal: number;
  onClose: () => void;
  onSuccess: (booking: BookingRecord) => void;
}

/* ─────────────────────────────────────────────────────────────
 * Presentational building blocks
 * (defined outside the modal so inputs never lose focus on re-render)
 * ───────────────────────────────────────────────────────────── */

// text-base on mobile prevents iOS from zooming into focused inputs
const INPUT_CLASS =
  "w-full h-12 rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-[#231E59] focus:ring-4 focus:ring-[#231E59]/10";

const Field: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    icon: LucideIcon;
    optional?: boolean;
  }
> = ({ label, icon: Icon, optional, ...inputProps }) => (
  <label className="block">
    <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-neutral-700">
      {label}
      {optional && (
        <span className="text-[10px] font-medium text-neutral-400">Optional</span>
      )}
    </span>
    <span className="relative block">
      <Icon
        size={17}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input {...inputProps} className={INPUT_CLASS} />
    </span>
  </label>
);

const SectionHeading: React.FC<{
  index: number;
  title: string;
  hint?: string;
}> = ({ index, title, hint }) => (
  <div className="flex items-center gap-3">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#231E59] text-[11px] font-bold text-white">
      {index}
    </span>
    <div className="min-w-0">
      <h4 className="text-sm font-bold text-[#231E59] font-heading leading-tight">
        {title}
      </h4>
      {hint && <p className="text-[11px] text-neutral-400 mt-0.5">{hint}</p>}
    </div>
  </div>
);

const STEP_LABELS = ['Details', 'Payment', 'Confirmed'];

/* ─────────────────────────────────────────────────────────────
 * Main component
 * ───────────────────────────────────────────────────────────── */

export const PaymentModal: React.FC<PaymentModalProps> = ({
  event,
  tier,
  quantity,
  selectedAddOns,
  addOnsTotal,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');

  // Customer Contact Info
  const [customerName, setCustomerName] = useState(
    currentUser?.name || ""
  );

  const [customerEmail, setCustomerEmail] = useState(
    currentUser?.email || ""
  );

  const [customerPhone, setCustomerPhone] = useState("");

  const [additionalAttendees, setAdditionalAttendees] = useState<
    EventAttendeeInput[]
  >([]);

  const [formError, setFormError] = useState("");

  // Success Booking Object
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    const requiredAdditional = Math.max(0, quantity - 1);

    setAdditionalAttendees((previous) =>
      Array.from({ length: requiredAdditional }, (_, index) =>
        previous[index] || {
          attendee_name: "",
          attendee_email: "",
          attendee_phone: "",
        }
      )
    );
  }, [quantity]);

  // Lock background scroll while the modal is open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const basePrice = tier.price * quantity;
  const convenienceFee = 0;
  const totalAmount = basePrice;

  const updateAttendee = (
    index: number,
    patch: Partial<EventAttendeeInput>
  ) => {
    setAdditionalAttendees((previous) => {
      const updated = [...previous];
      updated[index] = { ...updated[index], ...patch };
      return updated;
    });
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setFormError("Please complete all contact details.");
      return;
    }

    if (
      quantity > 1 &&
      additionalAttendees.some(
        (attendee) =>
          !attendee.attendee_name.trim() ||
          !attendee.attendee_email.trim()
      )
    ) {
      setFormError("Please complete the name and email for every attendee.");
      return;
    }

    setStep("processing");

    try {
      const attendees: EventAttendeeInput[] = [
        {
          attendee_name: customerName.trim(),
          attendee_email: customerEmail.trim(),
          attendee_phone: customerPhone.trim(),
        },
        ...additionalAttendees,
      ];

      const bookingData: CreateEventBookingInput = {
        event_id: Number(event.id),
        booking_type: quantity === 1 ? "individual" : "group",
        quantity,
        attendees,
      };

      const booking = await createEventBooking(bookingData);

      if (!booking.payment_required) {
        const freeBooking: BookingRecord = {
          id: booking.booking_reference,
          eventId: event.id,
          eventTitle: event.title,
          nativeTitle: event.nativeTitle,
          eventDate: event.date,
          eventTime: event.time,
          venue: event.venue,
          city: event.city,
          image: event.image,
          tierId: tier.id,
          tierName: tier.name,
          unitPrice: 0,
          quantity,
          addOnsTotal: 0,
          selectedAddOns: [],
          convenienceFee: 0,
          totalAmount: 0,
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod: "Free",
          paymentId: "",
          bookingTimestamp: Date.now(),
          status: "confirmed",
          qrCodeSeed: booking.booking_reference,
        };

        setConfirmedBooking(freeBooking);
        onSuccess(freeBooking);
        setStep("success");
        return;
      }

      const order = await createRazorpayOrder(
        booking.booking_reference
      );

      await loadRazorpayCheckout();

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout could not be loaded.");
      }

      const razorpay = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Iktaraa",
        description: order.event_title,
        order_id: order.order_id,

        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },

        theme: {
          color: "#231E59",
        },

        handler: async (response) => {
          try {
            setStep("processing");

            const paymentData: VerifyRazorpayPaymentInput = {
              booking_reference: booking.booking_reference,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            await verifyRazorpayPayment(paymentData);

            const confirmedAmount = order.amount / 100;

            const newBooking = {
              id: booking.booking_reference,
              eventId: event.id,
              eventTitle: event.title,
              nativeTitle: event.nativeTitle,
              eventDate: event.date,
              eventTime: event.time,
              venue: event.venue,
              city: event.city,
              image: event.image,
              tierId: tier.id,
              tierName: tier.name,
              unitPrice: tier.price,
              quantity,
              addOnsTotal: 0,
              selectedAddOns: [],
              convenienceFee: 0,
              totalAmount: confirmedAmount,
              customerName,
              customerEmail,
              customerPhone,
              paymentMethod: "Razorpay" as const,
              paymentId: response.razorpay_payment_id,
              bookingTimestamp: Date.now(),
              status: "confirmed" as const,
              qrCodeSeed: booking.booking_reference,
            };

            setConfirmedBooking(newBooking);
            onSuccess(newBooking);
            setStep("success");
          } catch (error) {
            console.error("Payment verification failed:", error);

            // These two cases involve money, so they stay as blocking alerts.
            if (
              error instanceof EventPlatformApiError &&
              error.status === 409
            ) {
              alert(
                `${error.message}\n\nYour refund has been initiated. Please do not attempt another payment for this booking.`
              );

              onClose();
              return;
            }

            if (
              error instanceof EventPlatformApiError &&
              error.status === 502 &&
              error.message.includes("Payment was captured")
            ) {
              alert(
                "Your payment was captured, but the refund could not be confirmed. Please contact Iktaraa support before attempting another payment."
              );

              onClose();
              return;
            }

            setFormError(
              error instanceof Error
                ? error.message
                : "Payment verification could not be completed. Please contact support before trying again."
            );

            setStep("checkout");
          }
        },

        modal: {
          ondismiss: () => {
            setStep("checkout");
          },
        },
      });

      razorpay.open();
    } catch (error) {
      console.error("Booking creation failed:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to create your booking. Please try again."
      );
      setStep("checkout");
    }
  };

  /* ───────────── Derived UI values ───────────── */

  const currentStepIndex = step === 'checkout' ? 0 : step === 'processing' ? 1 : 2;

  const headerTitle =
    step === 'success'
      ? 'Booking Confirmed'
      : step === 'processing'
        ? 'Processing Payment'
        : 'Secure Checkout';

  const headerSubtitle =
    step === 'success'
      ? 'Your pass has been generated'
      : step === 'processing'
        ? 'Please keep this window open'
        : 'Complete your booking in a minute';

  const payLabel = totalAmount > 0 ? `Pay ₹${totalAmount}` : 'Confirm Booking';

  const paymentMethods: { label: string; icon: LucideIcon }[] = [
    { label: 'UPI', icon: Smartphone },
    { label: 'Cards', icon: CreditCard },
    { label: 'NetBanking', icon: Building },
    { label: 'Wallets', icon: Wallet },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0E0B2B]/75 backdrop-blur-sm sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Event booking checkout"
        className="relative flex w-full sm:max-w-xl max-h-[94dvh] sm:max-h-[92vh] flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
      >
        {/* ───── Header ───── */}
        <div className="relative shrink-0 overflow-hidden bg-[#231E59] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6 text-white">
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#E34060]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-[#23A2B3]/25 blur-3xl" />

          {step !== 'processing' && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E34060]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78DED5] font-heading">
                Iktaraa · Secure Payment
              </span>
            </div>

            <h3 className="mt-2 text-lg sm:text-xl font-black font-heading leading-tight">
              {headerTitle}
            </h3>
            <p className="mt-0.5 text-xs text-white/65">{headerSubtitle}</p>

            {/* Progress */}
            <ol className="mt-4 flex items-center gap-2">
              {STEP_LABELS.map((label, index) => {
                const isDone = index < currentStepIndex || step === 'success';
                const isCurrent = index === currentStepIndex && step !== 'success';

                return (
                  <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition ${
                        isDone
                          ? 'bg-[#23A2B3] text-white'
                          : isCurrent
                            ? 'bg-[#E34060] text-white'
                            : 'bg-white/15 text-white/50'
                      }`}
                    >
                      {isDone ? <Check className="h-3 w-3" /> : index + 1}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        isCurrent || isDone ? 'text-white' : 'text-white/45'
                      }`}
                    >
                      {label}
                    </span>
                    {index < STEP_LABELS.length - 1 && (
                      <span
                        className={`h-px flex-1 ${isDone ? 'bg-[#23A2B3]' : 'bg-white/20'}`}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* ───── STEP 1: CHECKOUT ───── */}
        {step === 'checkout' && (
          <form onSubmit={handlePayNow} className="flex min-h-0 flex-1 flex-col">
            {/* Scrollable body */}
            <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              {/* Event summary */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-[#F6F5FB] p-3.5">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-16 w-16 shrink-0 rounded-xl border border-neutral-200 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#23A2B3] font-heading">
                    {event.category || 'Uncategorized'} · {event.city}
                  </span>
                  <h4 className="truncate text-sm font-bold text-[#231E59] font-heading">
                    {event.title}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </span>
                    <span className="inline-flex items-center gap-1 min-w-0">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </span>
                  </div>
                </div>
                <span className="hidden shrink-0 items-center gap-1 rounded-full bg-[#231E59] px-2.5 py-1 text-[10px] font-bold text-white sm:inline-flex">
                  <Ticket className="h-3 w-3" />
                  {quantity} × {tier.name}
                </span>
              </div>

              {/* 1. Contact details */}
              <section className="space-y-3.5">
                <SectionHeading
                  index={1}
                  title="Primary Guest"
                  hint="Your tickets and QR pass are sent here"
                />

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field
                      label="Full name"
                      icon={User}
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <Field
                    label="Email for QR ticket"
                    icon={Mail}
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                  <Field
                    label="Mobile number"
                    icon={Phone}
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="10-digit mobile number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </section>

              {/* 2. Additional attendees */}
              {quantity > 1 && (
                <section className="space-y-3.5">
                  <SectionHeading
                    index={2}
                    title="Additional Attendees"
                    hint={`${quantity - 1} more guest${quantity - 1 > 1 ? 's' : ''} — name and email required`}
                  />

                  <div className="space-y-3">
                    {additionalAttendees.map((attendee, index) => (
                      <div
                        key={index}
                        className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4"
                      >
                        <p className="flex items-center gap-2 text-xs font-bold text-[#231E59] font-heading">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E34060]/10 text-[10px] text-[#E34060]">
                            {index + 2}
                          </span>
                          Attendee {index + 2}
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <Field
                              label="Full name"
                              icon={User}
                              type="text"
                              required
                              placeholder="Full name"
                              value={attendee.attendee_name}
                              onChange={(e) =>
                                updateAttendee(index, { attendee_name: e.target.value })
                              }
                            />
                          </div>
                          <Field
                            label="Email address"
                            icon={Mail}
                            type="email"
                            required
                            inputMode="email"
                            placeholder="Email address"
                            value={attendee.attendee_email}
                            onChange={(e) =>
                              updateAttendee(index, { attendee_email: e.target.value })
                            }
                          />
                          <Field
                            label="Phone number"
                            icon={Phone}
                            type="tel"
                            optional
                            inputMode="tel"
                            placeholder="Phone number"
                            value={attendee.attendee_phone || ""}
                            onChange={(e) =>
                              updateAttendee(index, { attendee_phone: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Payment info */}
              <section className="space-y-3.5">
                <SectionHeading
                  index={quantity > 1 ? 3 : 2}
                  title="Payment"
                  hint="Choose how to pay on the next secure screen"
                />

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
                  <div className="grid grid-cols-4 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.label}
                          className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-white py-2.5 text-neutral-600"
                        >
                          <Icon className="h-4 w-4 text-[#231E59]" />
                          <span className="text-[10px] font-semibold">{method.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-neutral-500">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#23A2B3]" />
                    Payments are processed by Razorpay. Your card, UPI and bank details
                    are entered on Razorpay&apos;s secure window and never stored by Iktaraa.
                  </p>
                </div>
              </section>

              {/* Price breakdown */}
              <section className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4 text-xs shadow-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>
                    Pass ({tier.name} × {quantity})
                  </span>
                  <span className="font-semibold text-neutral-900 tabular-nums">₹{basePrice}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Convenience &amp; booking protection</span>
                  <span className="font-semibold text-emerald-600">
                    {convenienceFee === 0 ? 'Free' : `₹${convenienceFee}`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-dashed border-neutral-300 pt-3 font-bold font-heading">
                  <span className="text-sm text-[#231E59]">Total Amount</span>
                  <span className="text-2xl font-black text-[#E34060] tabular-nums">
                    ₹{totalAmount}
                  </span>
                </div>
              </section>
            </div>

            {/* Pinned footer */}
            <div className="shrink-0 space-y-3 border-t border-neutral-200 bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:px-6 sm:pb-5">
              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Total
                  </p>
                  <p className="text-xl font-black leading-tight text-[#231E59] font-heading tabular-nums">
                    ₹{totalAmount}
                  </p>
                </div>

                <button
                  type="submit"
                  className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E34060] to-[#C02D6F] text-sm font-black text-white shadow-lg shadow-[#E34060]/30 transition-all hover:from-[#cf3452] hover:to-[#a92661] active:scale-[0.98] font-heading"
                >
                  <Lock className="h-4 w-4" />
                  <span>{payLabel}</span>
                </button>
              </div>

              <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-neutral-400">
                <ShieldCheck className="h-3.5 w-3.5 text-[#23A2B3]" />
                256-bit encrypted checkout · Secured by Razorpay
              </p>
            </div>
          </form>
        )}

        {/* ───── STEP 2: PROCESSING ───── */}
        {step === 'processing' && (
          <div className="flex flex-1 flex-col items-center justify-center space-y-5 px-6 py-14 text-center sm:py-16">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-[#231E59]/10" />
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#E34060] border-r-[#23A2B3]" />
              <Lock className="absolute inset-0 m-auto h-5 w-5 text-[#231E59]" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-[#231E59] font-heading">
                Contacting Payment Gateway...
              </h4>
              <p className="mx-auto max-w-xs text-xs leading-relaxed text-neutral-500">
                Securing your ticket reservation. Please do not refresh or close this
                window.
              </p>
            </div>
          </div>
        )}

        {/* ───── STEP 3: SUCCESS ───── */}
        {step === 'success' && confirmedBooking && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-6 text-center sm:px-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl font-black text-[#231E59] font-heading">
                  Booking Confirmed!
                </h4>
                <p className="mx-auto max-w-sm text-xs leading-relaxed text-neutral-500">
                  Your admission pass is ready. A digital QR pass has also been sent to{' '}
                  <strong className="break-all text-neutral-800">{customerEmail}</strong>.
                </p>
              </div>

              {/* Ticket-style card */}
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-md">
                <div className="bg-[#231E59] px-4 py-3 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                    Booking reference
                  </p>
                  <p className="break-all font-mono text-base font-bold tracking-wide">
                    {confirmedBooking.id}
                  </p>
                </div>

                {/* perforation */}
                <div className="relative">
                  <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-white border border-neutral-200" />
                  <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-white border border-neutral-200" />
                  <div className="mx-4 border-t border-dashed border-neutral-300" />
                </div>

                <dl className="space-y-3 px-4 py-4 text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">Event</dt>
                    <dd className="text-right font-bold text-[#231E59]">
                      {confirmedBooking.eventTitle}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">Date &amp; venue</dt>
                    <dd className="text-right font-semibold text-neutral-800">
                      {confirmedBooking.eventDate} · {confirmedBooking.venue}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">Pass</dt>
                    <dd className="text-right font-semibold text-neutral-800">
                      {confirmedBooking.tierName} ({confirmedBooking.quantity}{' '}
                      {confirmedBooking.quantity === 1 ? 'guest' : 'guests'})
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-neutral-100 pt-3 font-bold font-heading">
                    <dt className="text-sm text-[#231E59]">Total paid</dt>
                    <dd className="text-xl font-black text-[#E34060] tabular-nums">
                      ₹{confirmedBooking.totalAmount}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="shrink-0 border-t border-neutral-200 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-5">
              <button
                type="button"
                onClick={onClose}
                className="h-12 w-full cursor-pointer rounded-xl bg-[#231E59] text-sm font-bold text-white shadow-lg shadow-[#231E59]/25 transition hover:bg-[#2f2677] active:scale-[0.99] font-heading"
              >
                Done &amp; View Experience
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};