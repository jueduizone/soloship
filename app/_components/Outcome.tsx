import { outcome } from './content'

export function Outcome() {
  return (
    <section
      className="ss-section"
      style={{
        background: 'var(--ss-bg-deep)',
        borderTop: '1px solid var(--ss-border-dark-soft)',
      }}
    >
      <div className="ss-container">
        <div className="mb-14" style={{ maxWidth: 780 }}>
          <div className="ss-eyebrow mb-6">{outcome.eyebrow}</div>
          <h2 className="ss-h2">{outcome.headline}</h2>
        </div>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {outcome.items.map((it, i) => (
            <div
              key={it.title}
              style={{
                padding: '28px 28px 28px 0',
                borderTop: '1px solid var(--ss-border-dark)',
              }}
            >
              <div
                className="ss-mono"
                style={{ color: 'var(--ss-accent-hi)', marginBottom: 16 }}
              >
                OUTCOME / {String(i + 1).padStart(2, '0')}
              </div>
              <h3
                style={{
                  color: 'var(--ss-text-strong)',
                  fontSize: 19,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  marginBottom: 10,
                  maxWidth: 280,
                }}
              >
                {it.title}
              </h3>
              <p
                style={{
                  color: 'var(--ss-text)',
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  maxWidth: 320,
                }}
              >
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
