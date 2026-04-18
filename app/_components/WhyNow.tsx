import { whyNow } from './content'

export function WhyNow() {
  return (
    <section id="why" className="ss-section is-light ss-hairline-top on-light">
      <div className="ss-container">
        <div className="grid gap-14 md:gap-20" style={{ gridTemplateColumns: '1fr' }}>
          <div style={{ maxWidth: 860 }}>
            <div className="ss-eyebrow is-light mb-6">{whyNow.eyebrow}</div>
            <h2
              className="ss-h2 is-light"
              style={{ fontSize: 'clamp(32px, 4.2vw, 52px)', letterSpacing: '-0.02em' }}
            >
              {whyNow.headline}
            </h2>
          </div>
          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {whyNow.body.map((p, i) => (
              <div key={i} style={{ maxWidth: 420 }}>
                <span className="ss-marker" style={{ color: 'var(--ss-accent)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-3" style={{ color: 'var(--ss-ink-2)', fontSize: 16, lineHeight: 1.7 }}>
                  {p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
