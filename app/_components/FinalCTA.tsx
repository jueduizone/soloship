import { finalCta, event } from './content'

export function FinalCTA() {
  return (
    <section
      id="apply"
      className="ss-section"
      style={{
        background: 'var(--ss-bg-deep)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(700px 360px at 80% 0%, var(--ss-accent-glow), transparent 60%)',
        }}
      />
      <div className="ss-container relative">
        <div style={{ maxWidth: 820 }}>
          <div className="ss-eyebrow mb-6">{finalCta.eyebrow}</div>
          <h2
            className="ss-display"
            style={{
              fontSize: 'clamp(36px, 5.4vw, 64px)',
              letterSpacing: '-0.02em',
            }}
          >
            {finalCta.headline}
          </h2>
          <p className="ss-lede mt-6" style={{ maxWidth: 620 }}>
            {finalCta.sub}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-10">
            <a href={finalCta.primaryCta.href} className="ss-btn ss-btn-primary">
              {finalCta.primaryCta.label}
              <span aria-hidden style={{ fontSize: 16 }}>→</span>
            </a>
            <a href={finalCta.secondaryCta.href} className="ss-btn ss-btn-ghost">
              {finalCta.secondaryCta.label}
            </a>
          </div>
          <p
            className="ss-mono mt-10"
            style={{ color: 'var(--ss-text-faint)' }}
          >
            审核制 · {event.capacity} · 录取后支付 {event.price}
          </p>
        </div>
      </div>
    </section>
  )
}
