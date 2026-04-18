import { event } from './content'

export function Nav() {
  return (
    <nav
      className="sticky top-0 z-20"
      style={{
        background: 'rgba(10,11,14,0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ss-border-dark-soft)',
      }}
    >
      <div className="ss-container flex items-center justify-between" style={{ height: 64 }}>
        <a href="#top" className="flex items-center gap-3">
          <span
            className="flex items-center justify-center rounded-md"
            style={{
              width: 24,
              height: 24,
              border: '1px solid var(--ss-border-dark)',
              background: 'var(--ss-surface)',
              color: 'var(--ss-text-strong)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            S
          </span>
          <span style={{ color: 'var(--ss-text-strong)', fontWeight: 600, fontSize: 15, letterSpacing: '-0.005em' }}>
            {event.name}
          </span>
          <span
            className="ss-mono"
            style={{
              color: 'var(--ss-text-dim)',
              padding: '2px 8px',
              border: '1px solid var(--ss-border-dark)',
              borderRadius: 999,
              fontSize: 10,
            }}
          >
            {event.volume}
          </span>
        </a>
        <div className="flex items-center gap-8">
          <a href="#why" className="hidden md:inline ss-mono" style={{ color: 'var(--ss-text-dim)' }}>
            WHY
          </a>
          <a href="#timeline" className="hidden md:inline ss-mono" style={{ color: 'var(--ss-text-dim)' }}>
            TIMELINE
          </a>
          <a href="#faq" className="hidden md:inline ss-mono" style={{ color: 'var(--ss-text-dim)' }}>
            FAQ
          </a>
          <a href={event.applyHref} className="ss-btn ss-btn-primary" style={{ height: 36, padding: '0 16px', fontSize: 13 }}>
            申请报名
          </a>
        </div>
      </div>
    </nav>
  )
}
