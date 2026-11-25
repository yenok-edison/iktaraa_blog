
import React, { useEffect, useState } from 'react';

import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  MapPin,
  ArrowRight,
} from 'lucide-react';

import type {
  EventFilterCriteria,
  EventCategory,
} from '../types/event';

import { SITE_METADATA } from '../data/site';
import { apiRequest } from '../../../shared/services/api';

interface EventFiltersProps {
  criteria: EventFilterCriteria;
  onUpdateCriteria: (partial: Partial<EventFilterCriteria>) => void;
  onReset: () => void;
  currentUserEmail?: string;
  totalStoriesCount: number;
}

interface PaginatedCategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EventCategory[];
}

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
    {children}
  </span>
);

export const EventFilters: React.FC<EventFiltersProps> = ({
  criteria,
  onUpdateCriteria,
  onReset,
  currentUserEmail,
  totalStoriesCount,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Category API state
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  // Fetch active event categories
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

        if (!Array.isArray(categoryList)) {
          throw new Error('Invalid categories API response.');
        }

        if (isMounted) {
          setCategories(categoryList);
          setCategoriesError(false);
        }
      } catch (error) {
        console.error('Failed to load event categories:', error);

        if (isMounted) {
          setCategoriesError(true);
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sorting options
  const sortOptions = [
    { id: 'newest' as const, label: 'Newest First' },
    { id: 'date-soon' as const, label: 'Happening Soon' },
    { id: 'price-low' as const, label: 'Price: Low to High' },
    { id: 'price-high' as const, label: 'Price: High to Low' },
    { id: 'most-liked' as const, label: 'Most Popular' },
  ];

  // Price range
  const priceMin = 500;
  const priceMax = 3000;

  const priceValue = criteria.priceRange[1];

  const pricePercent = Math.min(
    100,
    Math.max(
      0,
      ((priceValue - priceMin) / (priceMax - priceMin)) * 100
    )
  );

  // Category selection
  const isAllCategories = criteria.category === 'All';

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(35,30,89,0.07)]">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-neutral-100">

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#231E59]/10 text-[#231E59] flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>

          <div className="min-w-0 leading-tight">
            <h3 className="text-sm font-black text-[#231E59]">
              Filters
            </h3>

            <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
              {totalStoriesCount}{' '}
              {totalStoriesCount === 1 ? 'show' : 'shows'} found
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">

          <button
            type="button"
            onClick={onReset}
            title="Reset filters"
            className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-neutral-500 hover:text-[#E34060] hover:bg-[#E34060]/5 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>

          <button
            type="button"
            onClick={() => setMobileExpanded(!mobileExpanded)}
            aria-expanded={mobileExpanded}
            aria-label="Toggle filters"
            className="lg:hidden w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center hover:bg-neutral-200 transition-colors"
          >
            {mobileExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

        </div>
      </div>

      {/* Body */}
      <div
        className={`${
          mobileExpanded ? 'block' : 'hidden'
        } lg:block px-4 py-4 space-y-5`}
      >

        {/* Categories */}
        <section className="space-y-2">

          <SectionLabel>Categories</SectionLabel>

          <div className="space-y-1">

            {/* All Shows - frontend-only option */}
            <button
              type="button"
              onClick={() =>
                onUpdateCriteria({ category: 'All' })
              }
              className={`w-full h-9 flex items-center justify-between gap-2 px-3 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                isAllCategories
                  ? 'bg-[#E34060] text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <span className="truncate">
                All Shows
              </span>

              {isAllCategories && (
                <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-white" />
              )}
            </button>

            {/* Loading */}
            {categoriesLoading && (
              <p className="px-3 py-2 text-xs text-neutral-400">
                Loading categories...
              </p>
            )}

            {/* API error */}
            {!categoriesLoading && categoriesError && (
              <p className="px-3 py-2 text-xs text-red-500">
                Unable to load categories. Please refresh the page.
              </p>
            )}

            {/* Empty response */}
            {!categoriesLoading &&
              !categoriesError &&
              categories.length === 0 && (
                <p className="px-3 py-2 text-xs text-neutral-400">
                  No categories available.
                </p>
              )}

            {/* API categories */}
            {!categoriesLoading &&
              !categoriesError &&
              categories.map((cat) => {
                const isActive =
                  String(criteria.category) === String(cat.id);

                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() =>
                      // onUpdateCriteria({
                      //   category: String(cat.id),
                      // })
                      onUpdateCriteria({ category: cat.id })
                    }
                    className={`w-full h-9 flex items-center justify-between gap-2 px-3 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#E34060] text-white shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="truncate">
                      {cat.label}
                    </span>

                    {isActive && (
                      <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}

          </div>
        </section>

        <div className="h-px bg-neutral-100" />

        {/* Location */}
        <section className="space-y-2">

          <SectionLabel>Location</SectionLabel>

          <div className="relative">

            <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />

            <select
              value={criteria.city}
              onChange={(e) =>
                onUpdateCriteria({ city: e.target.value })
              }
              className="w-full h-10 appearance-none bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-9 text-xs font-semibold text-neutral-700 outline-none focus:ring-2 focus:ring-[#23A2B3]/40 focus:border-[#23A2B3] transition-all cursor-pointer"
            >
              {SITE_METADATA.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

          </div>
        </section>

        <div className="h-px bg-neutral-100" />

        {/* Sorting */}
        <section className="space-y-2">

          <SectionLabel>Sort By</SectionLabel>

          <div className="space-y-1">

            {sortOptions.map((opt) => {
              const isActive = criteria.sortBy === opt.id;

              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() =>
                    onUpdateCriteria({ sortBy: opt.id })
                  }
                  className={`w-full h-9 flex items-center justify-between gap-2 px-3 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E34060] text-white shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <ArrowRight className="w-3 h-3 shrink-0" />

                    <span className="truncate">
                      {opt.label}
                    </span>
                  </span>

                  {isActive && (
                    <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-white" />
                  )}
                </button>
              );
            })}

          </div>
        </section>

        <div className="h-px bg-neutral-100" />

        {/* Maximum Price */}
        <section className="space-y-3">

          <div className="flex items-center justify-between gap-2">

            <SectionLabel>
              Maximum Price
            </SectionLabel>

            <span className="px-2 py-0.5 rounded-md bg-[#231E59]/10 text-xs font-bold text-[#231E59] tabular-nums">
              ₹{priceValue.toLocaleString('en-IN')}
            </span>

          </div>

          <input
            type="range"
            min={priceMin}
            max={priceMax}
            step={100}
            value={priceValue}
            onChange={(e) =>
              onUpdateCriteria({
                priceRange: [
                  criteria.priceRange[0],
                  Number(e.target.value),
                ],
              })
            }
            style={{
              background: `linear-gradient(to right, #E34060 0%, #E34060 ${pricePercent}%, #e5e5e5 ${pricePercent}%, #e5e5e5 100%)`,
            }}
            className="w-full h-1.5 rounded-full appearance-none accent-[#E34060] cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-medium text-neutral-400 tabular-nums">
            <span>₹{priceMin.toLocaleString('en-IN')}</span>
            <span>₹{priceMax.toLocaleString('en-IN')}</span>
          </div>

        </section>

        {/* Uploaded by Me */}
        {currentUserEmail && (
          <>
            <div className="h-px bg-neutral-100" />

            <label className="flex items-center justify-between gap-3 h-10 px-3 bg-neutral-50 border border-neutral-100 rounded-lg cursor-pointer hover:bg-neutral-100/70 transition-colors">

              <span className="text-xs font-semibold text-neutral-700">
                Uploaded by Me
              </span>

              <input
                type="checkbox"
                checked={!!criteria.onlyUploadedByMe}
                onChange={(e) =>
                  onUpdateCriteria({
                    onlyUploadedByMe: e.target.checked,
                  })
                }
                className="w-4 h-4 shrink-0 accent-[#E34060] cursor-pointer"
              />

            </label>
          </>
        )}

      </div>
    </div>
  );
};
