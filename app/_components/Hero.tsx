import { hero, event } from './content'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden" style={{ paddingTop: 72, paddingBottom: 120 }}>
      <div className="ss-grid-overlay" />
      <div className="ss-hero-glow" />

      <div className="ss-container relative">
        <div className="ss-eyebrow mb-10">{hero.eyebrow}</div>

        <h1
          className="ss-display"
          style={{ fontSize: 'clamp(40px, 6.2vw, 84px)', maxWidth: 'min(15ch, 100%)' }}
        >
          {hero.headline}
        </h1>

        <p
          className="ss-lede mt-8"
          style={{ maxWidth: 620, color: 'var(--ss-text)' }}
        >
          {hero.sub}
        </p>

        <div className="ss-accent-rule mt-12 mb-6" />

        <dl
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px 40px',
            maxWidth: 760,
          }}
        >
          {hero.meta.map((m) => (
            <div key={m.label}>
              <dt
                className="ss-mono"
                style={{ color: 'var(--ss-text-faint)', marginBottom: 6 }}
              >
                {m.label.toUpperCase()}
              </dt>
              <dd style={{ color: 'var(--ss-text-strong)', fontSize: 15, fontWeight: 500 }}>
                {m.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center gap-3 mt-14">
          <a href={hero.primaryCta.href} className="ss-btn ss-btn-primary">
            {hero.primaryCta.label}
            <span aria-hidden style={{ fontSize: 16 }}>→</span>
          </a>
          <a href={hero.secondaryCta.href} className="ss-btn ss-btn-ghost">
            {hero.secondaryCta.label}
          </a>
        </div>

        <div
          className="ss-mono mt-10"
          style={{ color: 'var(--ss-text-faint)', maxWidth: 560 }}
        >
          审核制 / 录取后支付 · {event.price} · {event.capacity}
        </div>
      </div>
    </section>
  )
}
