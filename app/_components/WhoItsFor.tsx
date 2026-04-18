import { whoFor } from './content'

function Column({
  label,
  accent,
  items,
  sign,
}: {
  label: string
  accent: string
  items: string[]
  sign: '+' | '−'
}) {
  return (
    <div>
      <div
        className="ss-mono mb-6 flex items-center gap-3"
        style={{ color: accent }}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            width: 18,
            height: 18,
            border: `1px solid ${accent}`,
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
          }}
        >
          {sign}
        </span>
        {label}
      </div>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {items.map((it) => (
          <li
            key={it}
            style={{
              color: 'var(--ss-ink-2)',
              fontSize: 16,
              lineHeight: 1.55,
              paddingLeft: 0,
              borderTop: '1px solid var(--ss-border-light)',
              paddingTop: 18,
            }}
          >
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function WhoItsFor() {
  return (
    <section className="ss-section is-light ss-hairline-top on-light">
      <div className="ss-container">
        <div className="mb-14" style={{ maxWidth: 780 }}>
          <div className="ss-eyebrow is-light mb-6">{whoFor.eyebrow}</div>
          <h2 className="ss-h2 is-light">{whoFor.headline}</h2>
        </div>
        <div className="grid gap-12 md:gap-20" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <Column label="适合谁" accent="var(--ss-ink)" items={whoFor.suits} sign="+" />
          <Column label="不适合谁" accent="var(--ss-ink-3)" items={whoFor.notSuits} sign="−" />
        </div>
      </div>
    </section>
  )
}
