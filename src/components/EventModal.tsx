import React, { useState } from "react";
import { MusicEvent } from "../data/blogs.ts";
import { X, Calendar, MapPin, Clock, CheckCircle2, Ticket, Users } from "lucide-react";

interface EventModalProps {
  event: MusicEvent | null;
  onClose: () => void;
  onConfirm: (eventTitle: string, attendeeName: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onConfirm,
}) => {
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendeeName.trim()) return;
    setSubmitted(true);
    onConfirm(event.title, attendeeName);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setAttendeeName("");
      setAttendeePhone("");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            <Ticket className="w-3.5 h-3.5" />
            <span>Masterclass & Live Event RSVP</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {event.title}
          </h3>
          <p className="text-xs text-slate-500">{event.city} • {event.genre}</p>
        </div>

        {/* Event Details Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-semibold">{event.date}</span>
            <span className="text-slate-400">•</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-900">Pass Price:</span>
            <span className="text-sm font-extrabold text-rose-600">{event.price}</span>
          </div>
        </div>

        {/* Confirmation or Form */}
        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-base">Pass Reserved Successfully!</h4>
            <p className="text-xs text-emerald-700">
              We have reserved your spot for <strong>{event.title}</strong>. An SMS confirmation will be sent shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="e.g. Sreya Narayanan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={attendeePhone}
                  onChange={(e) => setAttendeePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Only {event.spotsLeft} seats left
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#189BA3] hover:bg-[#147e85] active:scale-95 text-white font-bold text-xs shadow-md shadow-teal-200 transition-all cursor-pointer"
              >
                Confirm Spot
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
