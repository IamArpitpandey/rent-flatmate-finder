import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Home, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const email = location.state?.email || '';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setDigits(pasted.split('').concat(Array(6).fill('')).slice(0, 6));
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) {
      toast.error('Enter all 6 digits');
      return;
    }
    setLoading(true);
    try {
      const user = await verifyOtp(email, otp);
      toast.success('Email verified — welcome to FlatMatch!');
      navigate(user.role === 'tenant' ? '/browse' : user.role === 'owner' ? '/owner' : '/admin');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOtp(email);
      toast.success('New code sent to your email');
      setCooldown(30);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
            <Home size={16} className="text-jade" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold text-lg">FlatMatch</span>
        </Link>

        <div className="card p-8">
          <div className="w-12 h-12 rounded-full bg-jade-light flex items-center justify-center mb-4">
            <Mail size={20} className="text-jade-dark" />
          </div>
          <h1 className="font-display text-2xl text-ink mb-1">Check your email</h1>
          <p className="text-sm text-slate mb-6">
            We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>
          </p>

          <form onSubmit={submit}>
            <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  className="w-11 h-13 aspect-square text-center text-lg font-mono font-semibold rounded-xl border border-ink/12 bg-white focus:border-jade focus:ring-1 focus:ring-jade outline-none"
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verifying...' : 'Verify email'} <ArrowRight size={14} />
            </button>
          </form>

          <p className="text-center text-sm text-slate mt-6">
            Didn't get a code?{' '}
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="text-jade-dark font-medium hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending...' : 'Resend code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}