import { EventItem, EventFilterCriteria } from '../types/event';

export const eventAdapter = {
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  },

  formatCompactPrice: (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  },

  matchesFilter: (
    event: EventItem,
    criteria: EventFilterCriteria,
    currentUserEmail?: string
  ): boolean => {
    // 1. Search filter
    if (criteria.search.trim()) {
      const q = criteria.search.toLowerCase();
      const titleMatch = event.title.toLowerCase().includes(q);
      const subtitleMatch = event.subtitle.toLowerCase().includes(q);
      const cityMatch = event.city.toLowerCase().includes(q);
      const genreMatch = event.genre.toLowerCase().includes(q);
      const venueMatch = event.venue.toLowerCase().includes(q);
      const uploaderMatch = event.uploadedBy?.name.toLowerCase().includes(q) || false;

      if (!titleMatch && !subtitleMatch && !cityMatch && !genreMatch && !venueMatch && !uploaderMatch) {
        return false;
      }
    }

    // 2. Category filter
    if (criteria.category !== undefined && criteria.category !== 'All') {
      if (event.categoryId !== criteria.category) {
        return false;
      }
    }

    // 3. City filter
    if (criteria.city && criteria.city !== 'All Cities') {
      if (event.city.toLowerCase() !== criteria.city.toLowerCase()) {
        return false;
      }
    }

    // 4. Price range filter
    if (criteria.priceRange) {
      const [min, max] = criteria.priceRange;
      if (event.price < min || event.price > max) {
        return false;
      }
    }

    // 5. Only selling fast
    if (criteria.onlySellingFast && !event.isSellingFast) {
      return false;
    }

    // 6. Genre filter
    if (criteria.genre && criteria.genre !== 'All Genres') {
      if (!event.genre.toLowerCase().includes(criteria.genre.toLowerCase())) {
        return false;
      }
    }

    // 7. Only uploaded by current user
    if (criteria.onlyUploadedByMe && currentUserEmail) {
      if (event.uploadedBy?.email !== currentUserEmail) {
        return false;
      }
    }

    return true;
  },

  sortEvents: (events: EventItem[], sortBy: EventFilterCriteria['sortBy']): EventItem[] => {
    const list = [...events];
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => (b.isoDate || '').localeCompare(a.isoDate || ''));
      case 'oldest':
        return list.sort((a, b) => (a.isoDate || '').localeCompare(b.isoDate || ''));
      case 'most-liked':
        return list.sort((a, b) => b.interestedCount - a.interestedCount);
      case 'most-viewed':
        return list.sort((a, b) => (b.bookedCount * 2 + b.interestedCount) - (a.bookedCount * 2 + a.interestedCount));
      case 'price-low':
        return list.sort((a, b) => a.price - b.price);
      case 'price-high':
        return list.sort((a, b) => b.price - a.price);
      case 'date-soon':
        return list.sort((a, b) => (a.isoDate || '').localeCompare(b.isoDate || ''));
      case 'recommended':
      default:
        return list.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));
    }
  },
};
