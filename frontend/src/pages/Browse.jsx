import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import ListingCard from '../components/listing/ListingCard';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';

const ROOM_TYPES = [
  { value: '', label: 'All types' },
  { value: 'single', label: 'Single' },
  { value: 'shared-double', label: 'Shared (Double)' },
  { value: 'shared-triple', label: 'Shared (Triple)' },
  { value: '1bhk', label: '1BHK' },
  { value: '2bhk', label: '2BHK' },
  { value: '3bhk', label: '3BHK' },
  { value: 'pg', label: 'PG' },
];

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', minRent: '', maxRent: '', roomType: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get('/listings', { params });
      setListings(data.listings);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchListings, 350);
    return () => clearTimeout(t);
  }, [fetchListings]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="animate-fadeUp">
      {/* Heading row */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Ranked by your compatibility score</span>
          <h1 className="font-display text-3xl lg:text-4xl text-ink mt-1">
            Browse <span className="text-gradient-jade">rooms</span>
          </h1>
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="btn-secondary relative"
        >
          <SlidersHorizontal size={14} /> Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-jade text-paper">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light pointer-events-none" />
        <input
          className="input-field pl-11 pr-10"
          placeholder="Search by city or area (e.g. Rohini, Delhi)"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        />
        {filters.city && (
          <button
            onClick={() => setFilters({ ...filters, city: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-ink/5 text-slate-light transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-5 mb-6 grid sm:grid-cols-3 gap-4 animate-fadeUp">
          <div>
            <label className="label">Min rent (₹)</label>
            <input
              type="number"
              className="input-field"
              placeholder="0"
              value={filters.minRent}
              onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Max rent (₹)</label>
            <input
              type="number"
              className="input-field"
              placeholder="No limit"
              value={filters.maxRent}
              onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Room type</label>
            <select
              className="input-field"
              value={filters.roomType}
              onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
            >
              {ROOM_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>
          {activeFilterCount > 0 && (
            <div className="sm:col-span-3 flex justify-end">
              <button
                onClick={() => setFilters({ city: '', minRent: '', maxRent: '', roomType: '' })}
                className="text-xs font-medium text-jade-dark hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <Loader label="Scoring listings against your profile" />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No listings match yet"
          body="Try widening your budget or clearing filters — or check back soon as new rooms are posted daily."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((l) => (
            <ListingCard key={l._id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
