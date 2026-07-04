import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Wallet, Calendar, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CompatibilityRing from '../components/ui/CompatibilityRing';
import Loader from '../components/ui/Loader';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);
        setListing(data.listing);
        setCompatibility(data.compatibility);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const expressInterest = async () => {
    setSending(true);
    try {
      await api.post('/interests', { listingId: id, message });
      setInterestSent(true);
      toast.success('Interest sent to the owner!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader label="Loading listing" />;
  if (!listing) return null;

  const owner = listing.owner || {};

  return (
    <div className="max-w-4xl mx-auto animate-fadeUp">
      <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink hover:-translate-x-1 transition-all mb-6">
        <ArrowLeft size={14} /> Back to listings
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT: gallery + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className="aspect-[16/10] rounded-xl2 bg-paperdim overflow-hidden ring-1 ring-ink/5 shadow-card">
            {listing.photos?.[0] ? (
              <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-jade-light/50 to-violet-light/40">
                <span className="font-display text-6xl font-bold text-ink/10">{listing.title[0]}</span>
              </div>
            )}
          </div>

          {/* Title block */}
          <div>
            <span className="text-xs font-mono uppercase tracking-wide text-jade-dark capitalize">
              {listing.roomType?.replace('-', ' ')} · {listing.furnishing?.replace('-', ' ')}
            </span>
            <h1 className="font-display text-3xl text-ink mt-1">{listing.title}</h1>
            <p className="flex items-center gap-1.5 text-sm text-slate mt-2">
              <MapPin size={14} className="text-jade-dark/70" /> {listing.location.address}, {listing.location.city}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-line">{listing.description}</p>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <span key={a} className="px-3 py-1.5 rounded-full bg-jade-light/60 text-xs font-medium text-jade-dark ring-1 ring-jade/15">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Owner card */}
          <div className="card p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold text-brass-dark shrink-0 bg-brass-light ring-1 ring-brass/20">
              {owner.avatar ? (
                <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
              ) : (
                owner.name?.[0]?.toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{owner.name}</p>
              <p className="text-xs text-slate">Listing owner</p>
            </div>
          </div>
        </div>

        {/* RIGHT: sticky sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          {/* Price card */}
          <div className="card p-5 glass-hover">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono font-bold text-2xl text-ink">
                ₹{listing.rent?.toLocaleString('en-IN')}
                <span className="text-sm font-body font-normal text-slate">/mo</span>
              </span>
            </div>
            <div className="space-y-2.5 text-sm text-slate">
              <p className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-jade-dark" /> Deposit ₹{listing.securityDeposit?.toLocaleString('en-IN') || 0}
              </p>
              <p className="flex items-center gap-2">
                <Calendar size={14} className="text-jade-dark" /> Available from{' '}
                {new Date(listing.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="flex items-center gap-2 capitalize">
                <Wallet size={14} className="text-jade-dark" /> {listing.genderPreference === 'any' ? 'Open to all' : `${listing.genderPreference}s only`}
              </p>
            </div>

            {user?.role === 'tenant' && (
              <>
                {!interestSent ? (
                  <div className="mt-5 pt-5 border-t border-ink/8">
                    <label className="label">Add a note (optional)</label>
                    <textarea
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Hi, I'm interested in this room..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button onClick={expressInterest} disabled={sending} className="btn-primary w-full mt-3">
                      {sending ? 'Sending...' : 'Express interest'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 pt-5 border-t border-ink/8 text-center text-sm text-jade-dark font-medium flex items-center justify-center gap-1.5">
                    <ShieldCheck size={15} /> Interest sent — track it under "My Interests".
                  </div>
                )}
              </>
            )}
          </div>

          {/* Compatibility card */}
          {compatibility && (
            <div className="card p-5 glass-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate">Your compatibility</span>
                <CompatibilityRing score={compatibility.score} size={52} strokeWidth={4} />
              </div>
              <p className="text-sm text-ink/80 leading-relaxed flex gap-2">
                <Sparkles size={14} className="text-brass-dark shrink-0 mt-0.5" />
                {compatibility.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
