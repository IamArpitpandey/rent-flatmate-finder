import Navbar from './Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ambient pastel aurora + floating blobs */}
      <div className="fm-aurora" aria-hidden />
      <div className="fm-blob b1" aria-hidden />
      <div className="fm-blob b2" aria-hidden />
      <div className="fm-blob b3" aria-hidden />

      <Navbar />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 pb-28 md:pb-8 animate-fadeUp">
        {children}
      </main>

      {/* dark glass footer */}
      <footer className="fm-footer">
        <div className="fm-footer-edge" aria-hidden />
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-jade to-jade-dark flex items-center justify-center shadow-glowJade">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAFAF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-paper">© 2026 FlatMatch</p>
              <p className="text-[11px] text-slate-light">Compatibility scoring powered by Gemini</p>
            </div>
          </div>
          <span className="font-mono text-[11px] text-slate-light/60">v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
