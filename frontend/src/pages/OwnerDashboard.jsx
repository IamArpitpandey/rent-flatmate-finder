import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, MapPin, Wallet, Eye, CheckCircle2, Trash2, Home } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';

export default function OwnerDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/listings/mine/all');
      setListings(data.listings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markFilled = async (id) => {
    try {
      await api.patch(`/listings/${id}/fill`);
      toast.success('Marked as filled — hidden from search');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this listing permanently?')) return;
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <span className="eyebrow">Owner dashboard</span>
          <h1 className="font-display text-3xl lg:text-4xl text-ink mt-1">
            My <span className="text-gradient-jade">listings</span>
          </h1>
        </div>
        <Link to="/owner/new" className="btn-primary">
          <Plus size={16} /> Post a room
        </Link>
      </div>

      {loading ? (
        <Loader label="Loading your listings" />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Home}
          title="You haven't listed a room yet"
          body="Post your first room to start receiving compatibility-scored interest from tenants."
          action={
            <Link to="/owner/new" className="btn-primary">
              <Plus size={16} /> Post a room
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((l) => (
            <div key={l._id} className="card glass-hover overflow-hidden">
              {/* Image */}
              <div className="aspect-[4/3] bg-paperdim relative">
                {l.photos?.[0] ? (
                  <img src={l.photos[0]} alt={l.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-jade-light/50 to-violet-light/40">
                    <span className="font-display text-5xl font-bold text-ink/10">{l.title[0]}</span>
                  </div>
                )}
                {/* status overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium capitalize backdrop-blur-sm ${
                    l.status === 'active'
                      ? 'bg-jade-light/90 text-jade-dark ring-1 ring-jade/20'
                      : 'bg-ink/80 text-paper'
                  }`}
                >
                  {l.status}
                </span>
                {/* views chip */}
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-paper/90 text-xs text-slate backdrop-blur-sm ring-1 ring-ink/5">
                  <Eye size={11} /> {l.viewsCount}
                </span>
              </div>

              {/* Body */}
              <div className="p-4">
                <h3 className="font-display font-medium text-ink line-clamp-1">{l.title}</h3>
                <p className="flex items-center gap-1 text-xs text-slate mt-1">
                  <MapPin size={12} className="text-jade-dark/70" /> {l.location.city}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono font-semibold text-sm text-ink flex items-center gap-1">
                    <Wallet size={12} className="text-jade-dark" /> ₹{l.rent.toLocaleString('en-IN')}
                    <span className="text-[10px] font-normal text-slate">/mo</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink/8">
                  {l.status === 'active' && (
                    <button
                      onClick={() => markFilled(l._id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-jade-dark hover:bg-jade-light rounded-lg py-2 transition-colors"
                    >
                      <CheckCircle2 size={13} /> Mark filled
                    </button>
                  )}
                  <button
                    onClick={() => remove(l._id)}
                    className="flex items-center justify-center gap-1 text-xs font-medium text-coral hover:bg-coral-light rounded-lg py-2 px-3 transition-colors"
                    aria-label="Delete listing"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
