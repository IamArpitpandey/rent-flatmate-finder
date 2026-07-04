/**
 * CompatibilityRing — the signature visual element of FlatMatch.
 * A radial gauge that reads as a doorknob/dial, tying the "home" subject
 * to the one number that matters most: how well this listing fits you.
 * Color interpolates coral -> brass -> jade so the ring itself carries
 * meaning, not just decoration.
 *
 * PREMIUM POLISH: exact token colors + soft glow that matches the score color.
 * All math/logic untouched.
 */
export default function CompatibilityRing({ score = 0, size = 56, strokeWidth = 4, showLabel = true }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Exact brand tokens — jade-dark / brass / coral
  const color = score >= 75 ? '#0A7259' : score >= 45 ? '#C08A2E' : '#E1493F';
  // unique filter id so multiple rings don't clash
  const filterId = `ring-glow-${Math.round(size)}-${color.replace('#', '')}`;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size, filter: `drop-shadow(0 0 ${size * 0.12}px ${color}55)` }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0B0E14"
          strokeOpacity="0.07"
          strokeWidth={strokeWidth}
        />
        {/* progress (meaningful color + glow) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ '--ring-full': circumference, '--ring-offset': offset }}
          className="animate-ringGrow"
        />
      </svg>
      {showLabel && (
        <span
          className="absolute inset-0 flex items-center justify-center font-mono font-bold text-ink leading-none"
          style={{ fontSize: size * 0.3 }}
        >
          {score}
        </span>
      )}
    </div>
  );
}
