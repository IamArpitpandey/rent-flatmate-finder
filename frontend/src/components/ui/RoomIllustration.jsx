// Custom flat-style illustration built from your existing design tokens
// (jade / jade-light / brass / brass-light / ink / paperdim) — no external
// images or stock assets, so it always matches the brand exactly.

export default function RoomIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-label="Illustration of a cozy furnished room with a window, sofa and plant"
    >
      {/* backdrop */}
      <rect width="400" height="300" className="fill-paperdim" />
      <rect width="400" height="300" className="fill-jade-light" opacity="0.35" />

      {/* window */}
      <rect x="230" y="28" width="130" height="150" rx="6" className="fill-brass-light" opacity="0.6" />
      <rect x="230" y="28" width="130" height="150" rx="6" fill="none" className="stroke-ink" strokeOpacity="0.15" strokeWidth="2" />
      <line x1="295" y1="28" x2="295" y2="178" className="stroke-ink" strokeOpacity="0.15" strokeWidth="2" />
      <line x1="230" y1="103" x2="360" y2="103" className="stroke-ink" strokeOpacity="0.15" strokeWidth="2" />
      {/* sun */}
      <circle cx="325" cy="60" r="16" className="fill-brass" opacity="0.8" />
      {/* distant hill / skyline through the window */}
      <path d="M230 150 Q260 120 300 148 T360 145 V178 H230 Z" className="fill-jade" opacity="0.35" />

      {/* rug */}
      <ellipse cx="180" cy="252" rx="150" ry="26" className="fill-brass" opacity="0.18" />

      {/* floor plant */}
      <rect x="52" y="205" width="26" height="34" rx="3" className="fill-brass-dark" opacity="0.85" />
      <path
        d="M65 205 C40 195 34 165 50 148 C58 168 60 188 65 205 Z
           M65 205 C90 198 100 168 86 148 C76 168 72 188 65 205 Z
           M65 205 C58 190 58 172 65 158 C72 172 72 190 65 205 Z"
        className="fill-jade-dark"
        opacity="0.9"
      />

      {/* sofa */}
      <rect x="95" y="180" width="150" height="55" rx="14" className="fill-ink" opacity="0.9" />
      <rect x="88" y="205" width="20" height="35" rx="8" className="fill-ink" opacity="0.9" />
      <rect x="237" y="205" width="20" height="35" rx="8" className="fill-ink" opacity="0.9" />
      <rect x="108" y="168" width="45" height="26" rx="8" className="fill-jade" />
      <rect x="158" y="168" width="45" height="26" rx="8" className="fill-brass" />
      <rect x="95" y="228" width="150" height="14" rx="6" className="fill-ink" opacity="0.75" />

      {/* side table + lamp */}
      <rect x="265" y="216" width="34" height="6" rx="2" className="fill-ink" opacity="0.5" />
      <rect x="279" y="222" width="6" height="18" className="fill-ink" opacity="0.5" />
      <path d="M270 200 L294 200 L288 216 L276 216 Z" className="fill-brass" opacity="0.9" />
      <line x1="282" y1="192" x2="282" y2="200" className="stroke-ink" strokeOpacity="0.5" strokeWidth="2" />

      {/* moving box, small detail tying to "move-in" theme */}
      <rect x="30" y="222" width="30" height="24" rx="2" className="fill-brass-light" />
      <line x1="30" y1="234" x2="60" y2="234" className="stroke-ink" strokeOpacity="0.2" strokeWidth="1.5" />
      <line x1="45" y1="222" x2="45" y2="246" className="stroke-ink" strokeOpacity="0.2" strokeWidth="1.5" />
    </svg>
  );
}