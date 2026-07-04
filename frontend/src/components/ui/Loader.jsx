export default function Loader({ label = 'Loading', full = true }) {
  return (
    <div className={`fm-loader-wrap ${full ? 'is-full' : ''}`}>
      <div className="fm-aurora" aria-hidden />
      <div className="fm-blob b1" aria-hidden />
      <div className="fm-blob b2" aria-hidden />

      <div className="fm-loader-card glass">
        <div className="fm-orbit">
          <span className="fm-orbit-core">FM</span>
          <span className="fm-orbit-ring" />
          <span className="fm-orbit-ring r2" />
          <span className="fm-orbit-dot" />
        </div>
        {label && <p className="fm-loader-label">{label}</p>}
      </div>
    </div>
  );
}
