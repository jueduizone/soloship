import { timeline } from './content'

export function Timeline() {
  return (
    <section
      id="timeline"
      className="ss-section"
      style={{
        background: 'var(--ss-bg)',
        borderTop: '1px solid var(--ss-border-dark-soft)',
      }}
    >
      <div className="ss-container">
        <div className="mb-14" style={{ maxWidth: 780 }}>
          <div className="ss-eyebrow mb-6">{timeline.eyebrow}</div>
          <h2 className="ss-h2">{timeline.headline}</h2>
        </div>

        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            borderTop: '1px solid var(--ss-border-dark)',
            borderLeft: '1px solid var(--ss-border-dark)',
          }}
        >
          {timeline.stages.map((s) => (
            <div
              key={s.phase}
              style={{
                padding: '32px 28px',
                borderRight: '1px solid var(--ss-border-dark)',
                borderBottom: '1px solid var(--ss-border-dark)',
                background: 'var(--ss-bg-alt)',
                minHeight: 260,
              }}
            >
              <div className="flex items-baseline justify-between mb-8">
                <span
                  className="ss-mono"
                  style={{ color: 'var(--ss-accent-hi)', fontSize: 13 }}
                >
                  {s.phase}
                </span>
                <span
                  className="ss-mono"
                  style={{ color: 'var(--ss-text-faint)' }}
                >
                  {s.when}
                </span>
              </div>
              <h3
                style={{
                  color: 'var(--ss-text-strong)',
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  marginBottom: 18,
                }}
              >
                {s.name}
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {s.points.map((p) => (
                  <li
                    key={p}
                    style={{
                      color: 'var(--ss-text)',
                      fontSize: 14,
                      lineHeight: 1.55,
                      paddingLeft: 14,
                      position: 'relative',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 9,
                        width: 6,
                        height: 1,
                        background: 'var(--ss-text-faint)',
                      }}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
