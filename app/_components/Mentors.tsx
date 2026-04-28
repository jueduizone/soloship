import { mentors } from './content'

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

export function Mentors() {
  return (
    <section
      id="mentors"
      className="ss-section"
      style={{
        background: 'var(--ss-bg)',
        borderTop: '1px solid var(--ss-border-dark-soft)',
      }}
    >
      <div className="ss-container">
        <div className="mb-14" style={{ maxWidth: 820 }}>
          <div className="ss-eyebrow mb-6">{mentors.eyebrow}</div>
          <h2 className="ss-h2">{mentors.headline}</h2>
          <p className="ss-lede mt-5" style={{ maxWidth: 720 }}>
            {mentors.sub}
          </p>
        </div>

        <div className="grid gap-6">
          {mentors.groups.map((group) => (
            <div key={group.label}>
              <div
                className="ss-mono mb-4"
                style={{ color: 'var(--ss-accent-hi)', letterSpacing: '0.12em' }}
              >
                {group.label}
              </div>
              <div
                className="grid gap-4 md:gap-5"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
              >
                {group.people.map((person) => {
                  const avatarUrl = (person as { avatarUrl?: string }).avatarUrl
                  return (
                  <article key={person.name} className="ss-card" style={{ minHeight: 230 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        marginBottom: 18,
                      }}
                    >
                      <div
                        aria-hidden={avatarUrl ? undefined : true}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: avatarUrl
                            ? 'rgba(255,255,255,0.04)'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))',
                          border: '1px solid var(--ss-border-dark-soft)',
                          color: 'var(--ss-accent-hi)',
                          fontSize: 16,
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          flex: '0 0 auto',
                          overflow: 'hidden',
                        }}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={person.name}
                            width={56}
                            height={56}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        ) : (
                          getInitials(person.name)
                        )}
                      </div>
                      <div
                        className="ss-mono"
                        style={{ color: 'var(--ss-text-faint)' }}
                      >
                        GUEST
                      </div>
                    </div>
                    <h3
                      style={{
                        color: 'var(--ss-text-strong)',
                        fontSize: 20,
                        fontWeight: 650,
                        letterSpacing: '-0.01em',
                        marginBottom: 8,
                      }}
                    >
                      {person.name}
                    </h3>
                    <p
                      style={{
                        color: 'var(--ss-accent-hi)',
                        fontSize: 13.5,
                        lineHeight: 1.55,
                        marginBottom: 14,
                      }}
                    >
                      {person.role}
                    </p>
                    <p style={{ color: 'var(--ss-text)', fontSize: 14.5, lineHeight: 1.7 }}>
                      {person.bio}
                    </p>
                  </article>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
