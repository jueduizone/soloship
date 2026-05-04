'use client'

import { useState } from 'react'
import { partners } from './content'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  const single = parts[0]
  if (/^[A-Za-z]/.test(single)) {
    return single.slice(0, 2).toUpperCase()
  }
  return single[0]
}

function PartnerBadge({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const showLogo = logoUrl && !logoFailed

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 38,
        padding: '5px 12px 5px 5px',
        borderRadius: 999,
        border: '1px solid var(--ss-border-light)',
        background: 'rgba(255,255,255,0.035)',
        color: 'var(--ss-text)',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: showLogo
            ? 'rgba(242,255,249,0.92)'
            : 'linear-gradient(135deg, rgba(0,251,135,0.12), rgba(255,255,255,0.03))',
          border: '1px solid var(--ss-border-light)',
          color: 'var(--ss-accent-hi)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.02em',
          flex: '0 0 auto',
          overflow: 'hidden',
        }}
      >
        {showLogo ? (
          <img
            src={logoUrl}
            alt=""
            width={20}
            height={20}
            style={{ width: 20, height: 20, objectFit: 'contain', display: 'block' }}
            onError={() => setLogoFailed(true)}
          />
        ) : (
          getInitials(name)
        )}
      </span>
      {name}
    </span>
  )
}

export function Partners() {
  return (
    <section
      id="partners"
      className="ss-section is-light"
      style={{ borderTop: '1px solid var(--ss-border-light-soft)' }}
    >
      <div className="ss-container">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div style={{ maxWidth: 560 }}>
            <div className="ss-eyebrow is-light mb-6">{partners.eyebrow}</div>
            <h2 className="ss-h2 is-light">{partners.headline}</h2>
            <p className="ss-lede is-light mt-5">{partners.sub}</p>
          </div>

          <div className="grid gap-5">
            {partners.groups.map((group) => (
              <article key={group.label} className="ss-card is-light">
                <div
                  className="ss-mono mb-5"
                  style={{ color: 'var(--ss-ink-3)', letterSpacing: '0.12em' }}
                >
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {group.items.map((item) => (
                    <PartnerBadge key={item.name} name={item.name} logoUrl={item.logoUrl} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
