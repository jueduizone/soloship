import { event } from './content'

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--ss-bg-deep)',
        borderTop: '1px solid var(--ss-border-dark-soft)',
        padding: '48px 0 56px',
      }}
    >
      <div className="ss-container flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--ss-text-strong)', fontWeight: 600, fontSize: 14 }}>
            {event.name}
          </span>
          <span
            className="ss-mono"
            style={{ color: 'var(--ss-text-faint)' }}
          >
            {event.volume} · {event.year}
          </span>
        </div>
        <div
          className="ss-mono"
          style={{ color: 'var(--ss-text-faint)' }}
        >
          © {new Date().getFullYear()} {event.name} — A cohort for people who actually ship.
        </div>
      </div>
    </footer>
  )
}
