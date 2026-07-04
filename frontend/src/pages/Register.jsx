import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Home, KeyRound, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    role: 'tenant',
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created — welcome to FlatMatch!');
      navigate(user.role === 'tenant' ? '/browse' : '/owner');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      {/* ambient aurora */}
      <div className="fm-aurora" aria-hidden />
      <div className="fm-blob b1" aria-hidden />
      <div className="fm-blob b2" aria-hidden />
      <div className="fm-blob b3" aria-hidden />

      <div className="relative z-10 w-full max-w-sm animate-fadeUp">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-jade to-jade-dark flex items-center justify-center shadow-glowJade">
            <Home size={16} className="text-paper" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">
            Flat<span className="fm-gradient-text">Match</span>
          </span>
        </Link>

        {/* Auth card */}
        <div className="card p-8 glass-hover">
          <h1 className="font-display text-2xl text-ink mb-1">Create your account</h1>
          <p className="text-sm text-slate mb-6">Takes less than a minute.</p>

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <RoleButton
              active={form.role === 'tenant'}
              icon={Search}
              label="I need a room"
              onClick={() => setForm({ ...form, role: 'tenant' })}
            />
            <RoleButton
              active={form.role === 'owner'}
              icon={KeyRound}
              label="I have a room"
              onClick={() => setForm({ ...form, role: 'owner' })}
            />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                required
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Arpit Pandey"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Phone</label>
                <input
                  className="input-field"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="98765 43210"
                />
              </div>
              <div>
                <label className="label">Gender</label>
                <select
                  className="input-field"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Create account'} <ArrowRight size={14} />
            </button>
          </form>

          <p className="text-center text-sm text-slate mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-jade-dark font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-all duration-300 ${
        active
          ? 'border-jade bg-jade-light text-jade-dark shadow-glowJade'
          : 'border-ink/12 text-slate hover:border-jade/40 hover:bg-jade-light/40'
      }`}
    >
      <Icon size={16} className={active ? 'scale-110 transition-transform' : 'transition-transform group-hover:scale-110'} />
      {label}
    </button>
  );
}