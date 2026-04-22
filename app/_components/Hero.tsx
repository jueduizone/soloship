import { hero } from './content'

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden"
      style={{ paddingTop: 48, paddingBottom: 56 }}
    >
      <div className="ss-grid-overlay" />
      <div className="ss-hero-glow" />

      <div className="ss-container relative">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="ss-eyebrow">{hero.eyebrow}</span>
          <span
            className="ss-mono inline-flex items-center gap-2"
            style={{
              color: 'var(--ss-text-dim)',
              padding: '4px 10px',
              border: '1px solid var(--ss-border-dark)',
              borderRadius: 999,
              fontSize: 10.5,
              letterSpacing: '0.08em',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: 999,
                background: 'var(--ss-accent-hi)',
                boxShadow: '0 0 0 3px rgba(58,108,255,0.18)',
              }}
            />
            {hero.status}
          </span>
        </div>

        <h1
          className="ss-display"
          style={{ fontSize: 'clamp(34px, 5.2vw, 72px)', maxWidth: 'min(15ch, 100%)' }}
        >
          {hero.headline}
        </h1>

        <p
          className="ss-lede mt-4"
          style={{ maxWidth: 580, color: 'var(--ss-text)' }}
        >
          {hero.sub}
        </p>

        <div className="ss-accent-rule mt-8 mb-5" />

        <dl
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '22px 40px',
            maxWidth: 760,
          }}
        >
          {hero.meta.map((m) => (
            <div key={m.label}>
              <dt
                className="ss-mono"
                style={{ color: 'var(--ss-text-faint)', marginBottom: 8, fontSize: 10.5 }}
              >
                {m.label.toUpperCase()}
              </dt>
              <dd style={{ color: 'var(--ss-text-strong)', fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em' }}>
                {m.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center gap-3 mt-8">
          <a href={hero.primaryCta.href} className="ss-btn ss-btn-primary">
            {hero.primaryCta.label}
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: 999,
                background: 'var(--ss-accent)',
              }}
            />
          </a>
          <a href={hero.secondaryCta.href} className="ss-btn ss-btn-ghost">
            {hero.secondaryCta.label}
            <span aria-hidden style={{ fontSize: 14, color: 'var(--ss-text-dim)' }}>↘</span>
          </a>
        </div>

        <div
          className="ss-mono mt-5"
          style={{ color: 'var(--ss-text-faint)', maxWidth: 600, fontSize: 11.5, lineHeight: 1.6 }}
        >
          {hero.fineprint}
        </div>
      </div>
    </section>
  )
}
