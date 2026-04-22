import { event, footer } from './content'

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--ss-bg-deep)',
        borderTop: '1px solid var(--ss-border-dark-soft)',
        padding: '56px 0 64px',
      }}
    >
      <div className="ss-container">
        <div className="grid gap-10 md:gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: 'var(--ss-accent)',
                }}
              />
              <span style={{ color: 'var(--ss-text-strong)', fontWeight: 600, fontSize: 15 }}>
                {event.name}
              </span>
              <span
                className="ss-mono"
                style={{ color: 'var(--ss-text-faint)', fontSize: 11 }}
              >
                {event.volume} · {event.year}
              </span>
            </div>
            <p
              style={{
                color: 'var(--ss-text-dim)',
                fontSize: 13.5,
                lineHeight: 1.6,
                maxWidth: 360,
              }}
            >
              {footer.tagline}
            </p>
          </div>

          <nav
            aria-label="footer"
            className="flex items-start md:justify-end gap-6 md:gap-8 flex-wrap"
          >
            {footer.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{
                  color: 'var(--ss-text-dim)',
                  fontSize: 13,
                  fontWeight: 450,
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div
          className="mt-12 pt-6 flex flex-wrap items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--ss-border-dark-soft)' }}
        >
          <span
            className="ss-mono"
            style={{ color: 'var(--ss-text-faint)', fontSize: 11 }}
          >
            © 2026 {event.name}
          </span>
          <span
            className="ss-mono"
            style={{ color: 'var(--ss-text-faint)', fontSize: 11 }}
          >
            {event.tagline} · {event.format}
          </span>
        </div>
      </div>
    </footer>
  )
}
