import React, { useEffect, useState } from 'react';
import { EventItem, EventFilterCriteria } from '../types/event';
import { EventCard } from './EventCard';
import { EventFilters } from './EventFilters';
import { Calendar, Search, X } from 'lucide-react';

import type { EventCategory } from '../types/event';
import { apiRequest } from '../../../shared/services/api';


interface PaginatedCategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EventCategory[];
}

interface EventListViewProps {
  events: EventItem[];
  criteria: EventFilterCriteria;
  onUpdateCriteria: (partial: Partial<EventFilterCriteria>) => void;
  onResetCriteria: () => void;
  onSelectEvent: (eventId: string) => void;
  currentUserEmail?: string;
}

export const EventListView: React.FC<EventListViewProps> = ({
  events,
  criteria,
  onUpdateCriteria,
  onResetCriteria,
  onSelectEvent,
  currentUserEmail,
}) => {
  const sortLabels: Record<string, string> = {
    newest: 'Newest First',
    'date-soon': 'Happening Soon',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    'most-liked': 'Most Popular',
    'most-viewed': 'Most Viewed',
    oldest: 'Oldest',
  };

  const [categories, setCategories] = useState<EventCategory[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const data = await apiRequest<
          EventCategory[] | PaginatedCategoryResponse
        >('api/event-platform/categories/');

        const categoryList = Array.isArray(data)
          ? data
          : data.results;

        if (isMounted && Array.isArray(categoryList)) {
          setCategories(categoryList);
        }
      } catch (error) {
        console.error('Failed to load event categories:', error);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentSortLabel = sortLabels[criteria.sortBy] || 'Newest First';

  // const categoryTabs = [
  //   { id: 'All', label: 'All Shows' },
  //   { id: 'Events', label: 'Live Events' },
  //   { id: 'Workshops', label: 'Workshops & Clinics' },
  //   { id: 'Jam Sessions', label: 'Jam Sessions' },
  //   { id: 'Music Studio', label: 'Music Studio' },
  // ];
  const categoryTabs = [
    { id: 'All' as const, label: 'All Shows' },
    ...categories.map((category) => ({
      id: category.id,
      label: category.label,
    })),
  ];
  
  const isAllCategory = criteria.category === 'All' || criteria.category === undefined;

  const categoryTitle = isAllCategory
    ? 'All Shows & Experiences'
    : 'Filtered Shows & Experiences';

  return (
    <section
      id="discovery-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 scroll-mt-20"
    >
      {/* Centred Search */}
      <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/90 backdrop-blur-xl border-2 border-[#231E59]/20 shadow-[0_6px_25px_rgba(35,30,89,0.10)] hover:border-[#231E59]/40 focus-within:border-[#E34060]/60 focus-within:shadow-[0_8px_28px_rgba(227,64,96,0.12)] transition-all duration-300">
          {/* Search Icon */}
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#231E59]/[0.07] shrink-0">
            <Search className="w-5 h-5 text-[#231E59]" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={criteria.search}
            onChange={(e) => onUpdateCriteria({ search: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            placeholder="Search events, artists, workshops or venues..."
            className="flex-1 min-w-0 h-11 bg-transparent border-none outline-none text-sm font-medium text-[#231E59] placeholder:text-neutral-400 placeholder:font-normal truncate"
          />

          {/* Clear Search */}
          {criteria.search && (
            <button
              type="button"
              onClick={() => onUpdateCriteria({ search: '' })}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-[#E34060] hover:bg-[#E34060]/5 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Button */}
          <button
            type="button"
            onClick={() => {
              document.getElementById('discovery-section')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}
            className="shrink-0 h-11 flex items-center justify-center gap-2 px-4 sm:px-6 rounded-xl bg-[#E34060] hover:bg-[#cf3452] active:scale-[0.97] text-white text-xs sm:text-sm font-bold shadow-md transition-all duration-200 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        <p className="text-center text-[11px] text-neutral-400 mt-2.5">
          Find your next musical experience
        </p>
      </div>

      {/* Discovery Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="w-full min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:[scrollbar-width:thin]">
          <EventFilters
            criteria={criteria}
            onUpdateCriteria={onUpdateCriteria}
            onReset={onResetCriteria}
            currentUserEmail={currentUserEmail}
            totalStoriesCount={events.length}
          />
        </aside>

        {/* Events Catalogue */}
        <div className="min-w-0 space-y-6">
          {/* Category Tabs (top edge aligns with the filters panel) */}
          <div
            role="tablist"
            aria-label="Event categories"
            className="flex items-center gap-1 p-1 rounded-2xl bg-white/80 backdrop-blur-xl shadow-[0_6px_24px_rgba(35,30,89,0.07)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categoryTabs.map((tab) => {
              const isActive =
                tab.id === 'All'
                  ? isAllCategory
                  : String(criteria.category) === String(tab.id);

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onUpdateCriteria({ category: tab.id })}
                  className={`shrink-0 sm:shrink sm:flex-1 h-10 flex items-center justify-center px-4 rounded-xl text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#E34060] text-white shadow-md'
                      : 'text-neutral-600 hover:bg-[#E34060]/10 hover:text-[#E34060]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Catalogue Heading */}
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pb-4 border-b border-neutral-200/80">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-[#231E59] tracking-tight leading-tight truncate">
                {categoryTitle}
              </h2>

              <p className="text-[11px] text-neutral-400 mt-1">
                Explore experiences and upcoming events
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline text-[11px] font-medium text-neutral-400">
                {currentSortLabel}
              </span>

              <span className="inline-flex items-center h-8 px-3.5 rounded-full bg-[#231E59]/10 text-[#231E59] text-xs font-bold tabular-nums">
                {events.length} {events.length === 1 ? 'Show' : 'Shows'}
              </span>
            </div>
          </div>

          {/* Events Grid */}
          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
              {events.map((event) => (
                <div key={event.id} className="min-w-0 h-full [&>*]:h-full">
                  <EventCard event={event} onSelect={onSelectEvent} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-sm px-6 py-14 sm:py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#231E59]/10 mx-auto flex items-center justify-center text-[#231E59]">
                <Calendar className="w-6 h-6" />
              </div>

              <h4 className="text-base font-bold text-[#231E59] mt-5">
                No matching shows found
              </h4>

              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed">
                No shows matched your current search or filter selection. Try
                changing your filters or resetting them.
              </p>

              <button
                type="button"
                onClick={onResetCriteria}
                className="mt-6 h-10 px-5 bg-[#E34060] hover:bg-[#cf3452] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};