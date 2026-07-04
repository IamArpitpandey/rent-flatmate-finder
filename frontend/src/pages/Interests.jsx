import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageCircle, Check, X, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CompatibilityRing from '../components/ui/CompatibilityRing';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';

const STATUS_STYLE = {
  pending: 'bg-brass-light text-brass-dark ring-brass/20',
  accepted: 'bg-jade-light text-jade-dark ring-jade/20',
  declined: 'bg-coral-light text-coral-dark ring-coral/20',
};

export default function Interests() {
  const { user } = useAuth();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/interests/mine');
      setInterests(data.interests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const respond = async (id, action) => {
    try {
      await api.patch(`/interests/${id}/respond`, { action });
      toast.success(action === 'accept' ? 'Accepted — chat is now open' : 'Declined');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader label="Loading requests" />;

  return (
    <div className="animate-fadeUp">
      <span className="eyebrow">{user.role === 'owner' ? 'Requests received' : 'Requests sent'}</span>
      <h1 className="font-display text-3xl lg:text-4xl text-ink mt-1 mb-8">
        {user.role === 'owner' ? 'Interest in your listings' : 'My interests'}
      </h1>

      {interests.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="Nothing here yet"
          body={
            user.role === 'owner'
              ? 'When tenants express interest in your listings, they will show up here.'
              : 'Browse listings and express interest to start seeing requests here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {interests.map((i) => (
            <div key={i._id} className="card glass-hover p-4 flex items-center gap-4 flex-wrap">
              {i.compatibilityScore && (
                <CompatibilityRing score={i.compatibilityScore.score} size={48} strokeWidth={3.5} />
              )}
              <div className="flex-1 min-w-[200px]">
                <p className="font-display text-base text-ink">{i.listing?.title}</p>
                <p className="text-xs text-slate mt-0.5">
                  {user.role === 'owner' ? `From ${i.tenant?.name}` : `To ${i.owner?.name}`} ·{' '}
                  {new Date(i.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                {i.message && <p className="text-xs text-ink/70 mt-1 italic">"{i.message}"</p>}
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ring-1 ${STATUS_STYLE[i.status]}`}>
                {i.status === 'pending' && <Clock size={11} className="inline mr-1 -mt-0.5" />}
                {i.status}
              </span>

              {user.role === 'owner' && i.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(i._id, 'accept')}
                    className="w-9 h-9 rounded-full bg-jade-light text-jade-dark flex items-center justify-center hover:bg-jade hover:text-paper hover:-translate-y-0.5 transition-all ring-1 ring-jade/20"
                    aria-label="Accept"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => respond(i._id, 'decline')}
                    className="w-9 h-9 rounded-full bg-coral-light text-coral-dark flex items-center justify-center hover:bg-coral hover:text-paper hover:-translate-y-0.5 transition-all ring-1 ring-coral/20"
                    aria-label="Decline"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {i.status === 'accepted' && (
                <Link to={`/chat/${i._id}`} className="btn-secondary py-2 px-4 text-xs">
                  <MessageCircle size={13} /> Open chat
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
