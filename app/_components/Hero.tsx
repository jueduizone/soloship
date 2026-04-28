import { event, hero } from './content'

const isAccentMeta = (label: string) => label === '价格'
const isFullWidthMeta = (label: string) => label === '价格' || label === '形式'

export function Hero() {
  return (
    <section
      id="top"
      className="ss-hero relative overflow-hidden"
    >
      <div className="ss-grid-overlay" />
      <div className="ss-hero-glow" />
      <div className="ss-hero-orb" aria-hidden />

      <div className="ss-container relative">
        <div className="ss-hero-grid">
          <div className="ss-hero-main">
            <div className="ss-hero-eyebrow-row">
              <span className="ss-eyebrow">{hero.eyebrow}</span>
              <span className="ss-mono ss-hero-status">
                <span aria-hidden className="ss-hero-status-dot" />
                {hero.status}
              </span>
            </div>

            <h1 className="ss-display ss-hero-headline">{hero.headline}</h1>

            <p className="ss-lede ss-hero-sub">{hero.sub}</p>

            <div className="ss-hero-cta-card">
              <div className="ss-hero-cta-actions">
                <a href={hero.primaryCta.href} className="ss-btn ss-btn-primary">
                  {hero.primaryCta.label}
                  <span aria-hidden className="ss-hero-cta-dot" />
                </a>
                <a href={hero.secondaryCta.href} className="ss-btn ss-btn-ghost">
                  {hero.secondaryCta.label}
                  <span aria-hidden style={{ fontSize: 14, color: 'var(--ss-text-dim)' }}>↘</span>
                </a>
              </div>
              <div className="ss-hero-fineprint ss-mono">{hero.fineprint}</div>
            </div>
          </div>

          <aside className="ss-hero-aside">
            <div className="ss-hero-summary">
              <div className="ss-hero-summary-head">
                <span className="ss-mono ss-hero-summary-label">PROGRAM</span>
                <span className="ss-mono ss-hero-summary-tag">
                  {event.volume} · {event.year}
                </span>
              </div>
              <dl className="ss-hero-meta-list">
                {hero.meta.map((m) => {
                  const cls = [
                    'ss-hero-meta-card',
                    isAccentMeta(m.label) ? 'is-accent' : '',
                    isFullWidthMeta(m.label) ? 'is-full' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                  return (
                    <div key={m.label} className={cls}>
                      <dt className="ss-mono ss-hero-meta-label">{m.label.toUpperCase()}</dt>
                      <dd className="ss-hero-meta-value">{m.value}</dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
