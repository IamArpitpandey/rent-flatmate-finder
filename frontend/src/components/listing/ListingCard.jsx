import { Link } from 'react-router-dom';
import { MapPin, Wallet, Calendar } from 'lucide-react';
import CompatibilityRing from '../ui/CompatibilityRing';

export default function ListingCard({ listing }) {
  const photo = listing.photos?.[0];

  return (
    <Link
      to={`/listing/${listing._id}`}
      className="card glass-hover group flex flex-col"
    >
      {/* Image header */}
      <div className="relative aspect-[4/3] bg-paperdim overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-jade-light/50 to-violet-light/40">
            <span className="font-display text-5xl font-bold text-ink/10">
              {listing.title?.[0]}
            </span>
          </div>
        )}

        {/* gradient overlay at bottom for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

        {/* Compatibility score */}
        {listing.compatibility && (
          <div className="absolute top-3 right-3 bg-paper/95 backdrop-blur rounded-full p-1 shadow-cardHover ring-1 ring-ink/5">
            <CompatibilityRing score={listing.compatibility.score} size={48} strokeWidth={3.5} />
          </div>
        )}

        {/* Room type tag */}
        <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-ink/80 text-paper text-[11px] font-mono capitalize backdrop-blur-sm">
          {listing.roomType?.replace('-', ' ')}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-display font-medium text-base text-ink leading-snug line-clamp-1 group-hover:text-jade-dark transition-colors">
          {listing.title}
        </h3>
        <p className="flex items-center gap-1 text-xs text-slate">
          <MapPin size={12} className="text-jade-dark/70" /> {listing.location?.city}
        </p>
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-ink/6">
          <span className="flex items-center gap-1 font-mono font-semibold text-ink">
            <Wallet size={13} className="text-jade-dark" /> ₹{listing.rent?.toLocaleString('en-IN')}
            <span className="text-[10px] font-normal text-slate">/mo</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-slate">
            <Calendar size={12} />
            {new Date(listing.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </Link>
  );
}
