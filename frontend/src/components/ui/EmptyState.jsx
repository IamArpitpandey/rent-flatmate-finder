export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 animate-fadeUp">
      {Icon && (
        <div className="relative mb-5">
          {/* soft glow ring behind icon */}
          <div className="absolute inset-0 rounded-2xl bg-jade/15 blur-xl scale-150" aria-hidden />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-jade-light to-violet-light flex items-center justify-center ring-1 ring-jade/20 shadow-card">
            <Icon size={26} className="text-jade-dark" strokeWidth={1.75} />
          </div>
        </div>
      )}
      <h3 className="font-display text-xl text-ink mb-1.5">{title}</h3>
      {body && (
        <p className="text-sm text-slate max-w-sm mb-6 leading-relaxed">{body}</p>
      )}
      {action}
    </div>
  );
}
