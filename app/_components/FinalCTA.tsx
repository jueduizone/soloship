import { finalCta } from './content'

export function FinalCTA() {
  return (
    <section
      id="waitlist"
      className="ss-section"
      style={{
        background: 'var(--ss-bg-deep)',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid var(--ss-border-dark-soft)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(720px 360px at 80% 0%, var(--ss-accent-glow), transparent 60%), radial-gradient(560px 320px at 8% 100%, rgba(255,255,255,0.03), transparent 70%)',
        }}
      />
      <div className="ss-container relative">
        <div style={{ maxWidth: 820 }}>
          <div className="ss-eyebrow mb-6">{finalCta.eyebrow}</div>
          <h2
            className="ss-display"
            style={{
              fontSize: 'clamp(34px, 5.2vw, 60px)',
              letterSpacing: '-0.02em',
              maxWidth: 'min(20ch, 100%)',
            }}
          >
            {finalCta.headline}
          </h2>
          <p className="ss-lede mt-6" style={{ maxWidth: 580 }}>
            {finalCta.sub}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-10">
            <a href={finalCta.primaryCta.href} className="ss-btn ss-btn-primary">
              {finalCta.primaryCta.label}
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
            <a href={finalCta.secondaryCta.href} className="ss-btn ss-btn-ghost">
              {finalCta.secondaryCta.label}
            </a>
          </div>

          <p
            className="ss-mono mt-10"
            style={{ color: 'var(--ss-text-faint)', fontSize: 11.5 }}
          >
            {finalCta.fineprint}
          </p>
        </div>
      </div>
    </section>
  )
}
