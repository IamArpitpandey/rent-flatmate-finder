import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(user.role === 'tenant' ? '/browse' : user.role === 'owner' ? '/owner' : '/admin');
    } catch (err) {
      if (err.needsVerification) {
        toast('Please verify your email first', { icon: '📧' });
        navigate('/verify-otp', { state: { email: err.email || form.email } });
        return;
      }
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
          <h1 className="font-display text-2xl text-ink mb-1">Welcome back</h1>
          <p className="text-sm text-slate mb-6">Log in to see your matches.</p>

          <form onSubmit={submit} className="space-y-4">
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
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Logging in...' : 'Log in'} <ArrowRight size={14} />
            </button>
          </form>

          <p className="text-center text-sm text-slate mt-6">
            New to FlatMatch?{' '}
            <Link to="/register" className="text-jade-dark font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="card p-4 mt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="badge-slate badge">Demo</span>
            <p className="font-semibold text-ink text-xs">Seed accounts</p>
          </div>
          <div className="text-xs text-slate leading-relaxed font-mono space-y-0.5">
            <p>Tenant: tenant1@flatmatch.app / Tenant@123</p>
            <p>Owner: owner1@flatmatch.app / Owner@123</p>
            <p>Admin: admin@flatmatch.app / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
