import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowRight, Wallet, MapPin, MessageSquareText, ShieldCheck, Mail,
  Sparkles, Star, Quote, TrendingUp, Zap, Heart
} from 'lucide-react';
import CompatibilityRing from '../components/ui/CompatibilityRing';
import RoomIllustration from '../components/ui/RoomIllustration';

export default function Landing() {
  const [demoScore, setDemoScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDemoScore(87), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ambient pastel aurora */}
      <div className="fm-aurora" aria-hidden />
      <div className="fm-blob b1" aria-hidden />
      <div className="fm-blob b2" aria-hidden />
      <div className="fm-blob b3" aria-hidden />

      {/* ============ NAV ============ */}
      <header className="fm-land-nav">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-20 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-jade to-jade-dark flex items-center justify-center shadow-glowJade">
              <span className="text-paper font-display font-bold text-xs sm:text-sm">F</span>
            </div>
            <span className="font-display font-semibold text-base sm:text-lg tracking-tight">
              Flat<span className="fm-gradient-text">Match</span>
            </span>
          </div>

          {/* Section anchor links (smooth scroll) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full fm-nav-pill">
            <a href="#how" className="fm-anchor">How it works</a>
            <a href="#trust" className="fm-anchor">Why us</a>
            <a href="#stories" className="fm-anchor">Stories</a>
          </nav>

          {/* Auth actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link to="/login" className="fm-land-login">
              Log in
            </Link>
            <Link to="/register" className="btn-primary btn-sm !px-3 sm:!px-6">
              <span className="hidden sm:inline">Get started</span>
              <span className="sm:hidden">Start</span> <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-16 md:pb-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: copy */}
        <div className="animate-fadeUp">
          <span className="eyebrow inline-flex items-center gap-1.5">
            <Sparkles size={12} /> AI-scored compatibility, not guesswork
          </span>
          <h1 className="font-display font-medium text-5xl lg:text-6xl leading-[1.05] mt-4 text-ink">
            Find a room whose <span className="italic text-gradient-jade">numbers</span> actually match yours.
          </h1>
          <p className="text-slate text-lg mt-6 max-w-lg leading-relaxed">
            FlatMatch scores every listing against your budget, location and lifestyle before you
            ever message an owner — so the only conversations you start are ones worth having.
          </p>
          <div className="flex items-center gap-4 mt-8 flex-wrap">
            <Link to="/register" className="btn-primary text-base px-7 py-3.5">
              Find a room <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="btn-secondary text-base px-7 py-3.5">
              List your room
            </Link>
          </div>

          {/* hero stats */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-8 mt-12">
            <Stat value="4,200+" label="Active listings" />
            <div className="hidden sm:block w-px h-10 bg-ink/10" />
            <Stat value="98%" label="Scored in &lt;3s" />
            <div className="hidden sm:block w-px h-10 bg-ink/10" />
            <Stat value="12k+" label="Matches made" />
          </div>
        </div>

        {/* Right: floating glass preview card with badges */}
        <div className="relative animate-fadeUp">
          {/* decorative glow */}
          <div className="absolute -inset-6 bg-gradient-to-br from-jade-light/40 via-violet-light/30 to-brass-light/40 blur-3xl rounded-full opacity-60" aria-hidden />

          {/* floating badge — top left */}
          <div className="hidden sm:block absolute -top-4 -left-2 z-20 card px-3 py-2 flex items-center gap-1.5 animate-float" style={{ animationDelay: '0.5s' }}>
            <Zap size={13} className="text-brass-dark" />
            <span className="text-xs font-mono font-semibold text-ink">Scored in 2.1s</span>
          </div>

          {/* floating badge — bottom right */}
          <div className="hidden sm:block absolute -bottom-3 -right-2 z-20 card px-3 py-2 flex items-center gap-1.5 animate-float" style={{ animationDelay: '1.2s' }}>
            <TrendingUp size={13} className="text-jade-dark" />
            <span className="text-xs font-mono font-semibold text-ink">87% fit</span>
          </div>

          {/* main card */}
          <div className="relative card p-6 max-w-sm ml-auto animate-float">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wide text-slate">Your match</span>
              <CompatibilityRing score={demoScore} size={64} strokeWidth={5} />
            </div>
            <div className="aspect-[4/3] rounded-xl mb-4 relative overflow-hidden">
              <RoomIllustration className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0" />
            </div>
            <h3 className="font-display text-lg text-ink">1BHK near Sector 7, Rohini</h3>
            <p className="text-sm text-slate flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-jade-dark/70" /> 0.6 km from your preferred area
            </p>
            <div className="mt-4 p-3 rounded-xl bg-paperdim/80 text-xs text-slate leading-relaxed border border-ink/5">
              <Sparkles size={12} className="inline text-brass-dark mr-1" />
              "Rent fits your ₹8k–12k budget and the location matches your search exactly.
              Furnishing and move-in date also align well."
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink/8">
              <span className="font-mono font-semibold text-ink flex items-center gap-1">
                <Wallet size={13} className="text-jade-dark" /> ₹9,500
                <span className="text-[10px] font-normal text-slate">/mo</span>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-jade-light text-jade-dark font-medium inline-flex items-center gap-1 ring-1 ring-jade/15">
                <Star size={10} className="fill-jade-dark" /> Strong match
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CITIES MARQUEE (dark) ============ */}
      <section className="relative z-10 py-10 overflow-hidden" style={{ background: 'linear-gradient(180deg, #1A1714 0%, #201C18 100%)' }}>
        {/* ambient glows */}
        <div className="absolute inset-0 opacity-70" aria-hidden style={{
          background: 'radial-gradient(600px 200px at 12% 50%, rgba(15,157,116,.18), transparent 70%), radial-gradient(600px 200px at 88% 50%, rgba(109,93,252,.16), transparent 70%)'
        }} />
        <div className="relative text-center mb-5">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-light/70">Live across Delhi NCR</span>
        </div>
        <div className="fm-marquee">
          <div className="fm-marquee-track">
            {[...MARQUEE_CITIES, ...MARQUEE_CITIES].map((city, i) => (
              <span key={i} className="fm-marquee-item">
                <MapPin size={13} className="text-jade/60" /> {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS (dark) ============ */}
      <section id="how" className="relative text-paper py-16 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(180deg, #201C18 0%, #1A1714 100%)' }}>
        <div className="absolute inset-0 opacity-60" aria-hidden style={{
          background: 'radial-gradient(800px 500px at 15% 10%, rgba(15,157,116,.20), transparent 60%), radial-gradient(700px 500px at 85% 80%, rgba(109,93,252,.18), transparent 60%), radial-gradient(600px 400px at 50% 50%, rgba(192,138,46,.08), transparent 60%)'
        }} />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center">
            <span className="eyebrow text-brass">How FlatMatch works</span>
            <h2 className="font-display text-3xl lg:text-4xl mt-3 max-w-xl mx-auto text-paper">
              Three steps, one AI compatibility score, zero brokerage.
            </h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8 mt-16">
            {/* connecting flow line (desktop) */}
            <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(15,157,116,.4) 20%, rgba(109,93,252,.4) 50%, rgba(192,138,46,.4) 80%, transparent)'
            }} aria-hidden />

            <Feature
              icon={MapPin}
              title="Tell us what fits"
              body="Set your budget, preferred area and move-in date once. Owners list rooms with rent, amenities and photos."
              step="01"
            />
            <Feature
              icon={Sparkles}
              title="We score every listing"
              body="Gemini compares your profile against each room and returns a 0–100 fit score with a plain-English reason."
              step="02"
            />
            <Feature
              icon={MessageSquareText}
              title="Chat once it's mutual"
              body="Express interest, the owner accepts or declines, and a private real-time chat opens up instantly."
              step="03"
            />
          </div>
        </div>
      </section>

      {/* ============ TRUST ============ */}
      <section id="trust" className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-14">
          <span className="eyebrow">Why people trust us</span>
          <h2 className="font-display text-3xl lg:text-4xl mt-3">Built for honest, no-brokerage rentals</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <TrustCard icon={ShieldCheck} title="Verified conversations" body="Your phone number stays private until you choose to share it inside a chat." />
          <TrustCard icon={Mail} title="You're notified, not spammed" body="Owners get an email the moment a high-match tenant shows interest — nothing else." />
          <TrustCard icon={Wallet} title="Zero brokerage, always" body="FlatMatch never charges tenants or owners a commission on rent." />
        </div>
      </section>

      {/* ============ TESTIMONIALS (new) ============ */}
      <section id="stories" className="relative z-10 max-w-7xl mx-auto px-6 pb-16 md:pb-24">
        <div className="text-center mb-14">
          <span className="eyebrow">Loved by tenants & owners</span>
          <h2 className="font-display text-3xl lg:text-4xl mt-3">Real matches, real moves</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Testimonial
            quote="Found a flat in 3 days that matched my ₹10k budget exactly. No broker, no nonsense."
            name="Arpit P."
            role="Tenant · Rohini"
            tone="jade"
          />
          <Testimonial
            quote="The compatibility score is wild — it filters out people who'd never take the room anyway."
            name="Sneha R."
            role="Owner · Dwarka"
            tone="violet"
          />
          <Testimonial
            quote="Got matched, chatted, moved in. Whole thing took a week. Insane."
            name="Karan M."
            role="Tenant · Noida"
            tone="brass"
          />
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section id="cta" className="relative z-10 max-w-7xl mx-auto px-6 pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-xl3 p-8 md:p-16 text-center" style={{ background: 'linear-gradient(135deg, #0F9D74 0%, #6D5DFC 100%)' }}>
          <div className="absolute inset-0 opacity-30" aria-hidden style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.25) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
          <div className="relative">
            <h2 className="font-display text-3xl lg:text-4xl text-paper">Ready to find your match?</h2>
            <p className="text-paper/80 mt-3 max-w-md mx-auto">Join thousands finding rooms that actually fit — no brokers, no guesswork.</p>
            <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-paper text-ink font-body font-semibold px-7 py-3.5 text-base transition-all hover:-translate-y-0.5 hover:shadow-xl">
                Get started free <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-paper/40 text-paper font-body font-semibold px-7 py-3.5 text-base transition-all hover:bg-paper/10">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="fm-footer">
        <div className="fm-footer-edge" aria-hidden />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-jade to-jade-dark flex items-center justify-center shadow-glowJade">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAFAF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" />
                  </svg>
                </div>
                <span className="font-display font-semibold text-lg text-paper">FlatMatch</span>
              </div>
              <p className="text-sm text-slate-light leading-relaxed max-w-xs">
                Find rooms whose numbers actually match yours. Zero brokerage, AI-scored compatibility.
              </p>
            </div>

            {/* Tech badge */}
            <div className="md:justify-self-end md:text-right">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-brass mb-3">Powered by</p>
              <p className="text-sm text-slate-light">Gemini AI compatibility</p>
              <p className="text-sm text-slate-light">Real-time socket chat</p>
              <span className="font-mono text-[11px] text-slate-light/60 block mt-3">v1.0.0</span>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-paper/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-light/70">
            <span>© 2026 FlatMatch. All rights reserved.</span>
            <span>Made with ♥ for honest rentals</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============ constants ============ */
const MARQUEE_CITIES = [
  'Rohini', 'Dwarka', 'Saket', 'Laxmi Nagar', 'Noida Sec 62',
  'Model Town', 'Pitampura', 'Janakpuri', 'Gurgaon', 'Faridabad'
];

/* ============ sub-components ============ */
function Stat({ value, label }) {
  return (
    <div>
      <p className="font-mono font-bold text-ink text-lg" dangerouslySetInnerHTML={{ __html: value }} />
      <p className="text-xs text-slate">{label}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, body, step }) {
  return (
    <div className="group relative text-center md:text-left">
      <span className="absolute -top-6 right-0 md:right-0 font-display text-6xl font-bold text-paper/10 group-hover:text-paper/20 transition-colors">{step}</span>
      <div className="relative inline-flex md:flex w-14 h-14 rounded-2xl bg-jade/15 items-center justify-center mb-5 ring-1 ring-jade/25 group-hover:bg-jade/25 group-hover:scale-110 transition-all">
        <Icon size={22} className="text-jade" />
      </div>
      <h3 className="font-display text-xl mb-2 text-paper">{title}</h3>
      <p className="text-sm text-paper/70 leading-relaxed">{body}</p>
    </div>
  );
}

function TrustCard({ icon: Icon, title, body }) {
  return (
    <div className="card p-6 glass-hover">
      <div className="w-11 h-11 rounded-xl bg-brass/10 flex items-center justify-center mb-3 ring-1 ring-brass/20">
        <Icon size={20} className="text-brass-dark" strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg mb-1.5">{title}</h3>
      <p className="text-sm text-slate leading-relaxed">{body}</p>
    </div>
  );
}

function Testimonial({ quote, name, role, tone = 'jade' }) {
  const tones = {
    jade: 'bg-jade-light text-jade-dark ring-jade/20',
    violet: 'bg-violet-light text-violet-dark ring-violet/20',
    brass: 'bg-brass-light text-brass-dark ring-brass/20',
  };
  return (
    <div className="card p-6 glass-hover flex flex-col">
      <Quote size={22} className="text-ink/15 mb-3" />
      <p className="text-sm text-ink/80 leading-relaxed flex-1">"{quote}"</p>
      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-ink/6">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ring-1 bg-gradient-to-br ${tones[tone]}`}>
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{name}</p>
          <p className="text-xs text-slate">{role}</p>
        </div>
      </div>
    </div>
  );
}