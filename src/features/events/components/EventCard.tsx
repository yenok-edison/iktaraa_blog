
import React from 'react';
import { EventItem } from '../types/event';
import { Calendar, ArrowUpRight } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  onSelect: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
}) => {

  // const categoryLabel = event.category?.label || 'Uncategorized';
  const categoryLabel = event.category || 'Uncategorized';

  const handleSelect = () => {
    onSelect(event.id);
  };

  return (
    <article
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${event.title}`}
      className="group relative w-full aspect-[4/4.5] min-h-[280px] overflow-hidden rounded-2xl bg-[#17152D] border border-white/50 shadow-[0_5px_20px_rgba(35,30,89,0.08)] hover:shadow-[0_12px_35px_rgba(35,30,89,0.18)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >

      {/* FULL COVER EVENT IMAGE */}
      <div className="absolute inset-0 overflow-hidden">

        <img
          src={event.image || undefined}
          alt={event.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />

      </div>

      {/* TOP GLASS BADGES */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2">

        {/* Category */}
        <span className="max-w-[65%] truncate px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-xl border border-white/30 text-white text-[10px] sm:text-[11px] font-bold tracking-wide shadow-sm">
          {categoryLabel}
        </span>

        {/* Date */}
        <span className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/30 backdrop-blur-xl border border-white/20 text-white text-[10px] sm:text-[11px] font-semibold">
          <Calendar className="w-3 h-3 text-white/80" />
          {event.date}
        </span>

      </div>

      {/* BOTTOM CONTENT */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-4">

        {/* Native Title */}
        {event.nativeTitle && (
          <p className="text-[10px] sm:text-xs text-white/80 font-semibold mb-1 truncate">
            {event.nativeTitle}
          </p>
        )}

        {/* Event Title */}
        <h3 className="text-base sm:text-lg font-black text-white font-heading truncate leading-snug group-hover:text-[#FFD6DE] transition-colors">
          {event.title}
        </h3>

        {/* Event Description */}
        <p className="text-[11px] sm:text-xs text-white/75 font-medium truncate mt-1 mb-3">
          {event.subtitle || event.description}
        </p>

        {/* GLASS FOOTER */}
        <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-white/15 backdrop-blur-xl border border-white/20 shadow-lg">

          {/* Price */}
          <div className="min-w-0">

            <span className="block text-[9px] text-white/65 uppercase tracking-wider font-bold">
              Passes from
            </span>

            <div className="flex items-baseline gap-1.5 flex-wrap">

              <span className="text-base sm:text-lg font-black text-white font-heading">
                ₹{event.price.toLocaleString('en-IN')}
              </span>

              {event.originalPrice &&
                event.originalPrice > event.price && (
                  <span className="text-[10px] text-white/60 line-through">
                    ₹{event.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}

            </div>

          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect();
            }}
            className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#E34060] hover:bg-[#cf3452] active:scale-95 text-white text-[10px] sm:text-xs font-bold shadow-md transition-all duration-200 cursor-pointer"
          >
            <span>Explore Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

    </article>
  );
};
