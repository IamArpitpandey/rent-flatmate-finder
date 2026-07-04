import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="fm-loader-wrap is-full">
      <div className="fm-aurora" aria-hidden />
      <div className="fm-blob b1" aria-hidden />
      <div className="fm-blob b2" aria-hidden />
      <div className="fm-blob b3" aria-hidden />

      <div className="container text-center animate-fadeUp" style={{ position: 'relative', zIndex: 2 }}>
        <div className="nf-code">
          <span className="fm-gradient-text">4</span>
          <span className="nf-orb" />
          <span className="fm-gradient-text">4</span>
        </div>
        <h1 className="mt-2">Page not found</h1>
        <p className="mb-4 text-slate" style={{ maxWidth: 460, marginInline: 'auto' }}>
          Looks like this flat doesn't exist yet — or you wandered into the wrong hallway.
          Let's get you back home.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Link to="/" className="btn-primary btn-lg">Back to Home</Link>
          <Link to="/browse" className="btn-secondary btn-lg">Browse Listings</Link>
        </div>
      </div>
    </div>
  );
}
