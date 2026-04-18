import { whySoloship } from './content'

export function WhySoloShip() {
  return (
    <section className="ss-section" style={{ background: 'var(--ss-bg)' }}>
      <div className="ss-container">
        <div className="grid gap-14" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <div style={{ maxWidth: 780 }}>
            <div className="ss-eyebrow mb-6">{whySoloship.eyebrow}</div>
            <h2 className="ss-h2">{whySoloship.headline}</h2>
          </div>
          <div
            className="grid gap-4 md:gap-5"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
          >
            {whySoloship.cards.map((c, i) => (
              <article key={c.title} className="ss-card" style={{ minHeight: 220 }}>
                <div
                  className="ss-mono"
                  style={{ color: 'var(--ss-text-faint)', marginBottom: 28 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3
                  style={{
                    color: 'var(--ss-text-strong)',
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    marginBottom: 10,
                  }}
                >
                  {c.title}
                </h3>
                <p style={{ color: 'var(--ss-text)', fontSize: 14.5, lineHeight: 1.65 }}>
                  {c.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
