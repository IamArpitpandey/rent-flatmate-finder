import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Users, Home, MessageSquareHeart, Send, ShieldOff, ShieldCheck, Trash2 } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/ui/Loader';

const TABS = ['Overview', 'Users', 'Listings'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, u, l] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/listings'),
      ]);
      setStats(s.data.stats);
      setUsers(u.data.users);
      setListings(l.data.listings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-active`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeListing = async (id) => {
    if (!confirm('Remove this listing from the platform?')) return;
    try {
      await api.delete(`/admin/listings/${id}`);
      toast.success('Listing removed');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader label="Loading admin data" />;

  return (
    <div className="animate-fadeUp">
      <span className="eyebrow">Platform control</span>
      <h1 className="font-display text-3xl lg:text-4xl text-ink mt-1 mb-6">
        Admin <span className="text-gradient-jade">dashboard</span>
      </h1>

      {/* Tabs — glass pill style */}
      <div className="inline-flex gap-1 mb-8 p-1 rounded-full glass-soft">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
              tab === t
                ? 'bg-gradient-to-br from-jade to-jade-dark text-paper shadow-glowJade'
                : 'text-slate hover:text-ink hover:bg-white/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ===== Overview ===== */}
      {tab === 'Overview' && stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total users" value={stats.totalUsers} sub={`${stats.totalTenants} tenants · ${stats.totalOwners} owners`} tone="jade" />
          <StatCard icon={Home} label="Active listings" value={stats.activeListings} sub={`${stats.totalListings} total posted`} tone="violet" />
          <StatCard icon={Send} label="Interest requests" value={stats.totalInterests} sub={`${stats.acceptedInterests} accepted`} tone="brass" />
          <StatCard icon={MessageSquareHeart} label="Messages sent" value={stats.totalMessages} sub="across all chats" tone="jade" />
        </div>
      )}

      {/* ===== Users table ===== */}
      {tab === 'Users' && (
        <div className="card overflow-hidden glass-hover">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-paperdim/70 text-xs uppercase tracking-wide text-slate">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Role</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-ink/6 hover:bg-jade-light/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                    <td className="px-4 py-3 text-slate">{u.email}</td>
                    <td className="px-4 py-3 capitalize text-slate">{u.role}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${u.isActive ? 'bg-jade-light text-jade-dark ring-jade/20' : 'bg-coral-light text-coral-dark ring-coral/20'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleActive(u._id)}
                          className="text-xs font-medium text-slate hover:text-ink inline-flex items-center gap-1 hover:-translate-y-0.5 transition-all"
                        >
                          {u.isActive ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== Listings table ===== */}
      {tab === 'Listings' && (
        <div className="card overflow-hidden glass-hover">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-paperdim/70 text-xs uppercase tracking-wide text-slate">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Title</th>
                  <th className="text-left px-4 py-3 font-semibold">Owner</th>
                  <th className="text-left px-4 py-3 font-semibold">City</th>
                  <th className="text-left px-4 py-3 font-semibold">Rent</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l._id} className="border-t border-ink/6 hover:bg-jade-light/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{l.title}</td>
                    <td className="px-4 py-3 text-slate">{l.owner?.name}</td>
                    <td className="px-4 py-3 text-slate">{l.location?.city}</td>
                    <td className="px-4 py-3 font-mono text-slate">₹{l.rent?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 capitalize text-slate">{l.status}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeListing(l._id)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-coral hover:bg-coral-light hover:text-coral-dark transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone = 'jade' }) {
  const tones = {
    jade: 'from-jade-light to-jade-light/40 text-jade-dark ring-jade/20',
    violet: 'from-violet-light to-violet-light/40 text-violet-dark ring-violet/20',
    brass: 'from-brass-light to-brass-light/40 text-brass-dark ring-brass/20',
  };
  return (
    <div className="card glass-hover p-5">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tones[tone]} flex items-center justify-center ring-1 mb-3`}>
        <Icon size={18} />
      </div>
      <p className="font-mono font-bold text-2xl text-ink">{value}</p>
      <p className="text-sm text-ink/80 mt-0.5">{label}</p>
      <p className="text-xs text-slate mt-1">{sub}</p>
    </div>
  );
}
