import { event, nav } from './content'
import { createClient } from '@/lib/supabase/server'
import { isOrganizerUser } from '@/lib/auth/require-organizer'

export async function Nav() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const showAdmin = user ? isOrganizerUser(user) : false

  return (
    <nav
      className="sticky top-0 z-20"
      style={{
        background: 'rgba(10,11,14,0.78)',
        backdropFilter: 'saturate(140%) blur(14px)',
        WebkitBackdropFilter: 'saturate(140%) blur(14px)',
        borderBottom: '1px solid var(--ss-border-dark-soft)',
      }}
    >
      <div className="ss-container flex items-center justify-between" style={{ height: 60 }}>
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${event.name} ${event.volume}`}>
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 2,
              background: 'var(--ss-accent)',
              boxShadow: '0 0 0 3px rgba(58,108,255,0.14)',
            }}
          />
          <span
            style={{
              color: 'var(--ss-text-strong)',
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: '-0.01em',
            }}
          >
            {event.name}
          </span>
          <span
            className="ss-mono hidden sm:inline-flex items-center"
            style={{
              color: 'var(--ss-text-dim)',
              padding: '2px 8px',
              border: '1px solid var(--ss-border-dark)',
              borderRadius: 999,
              fontSize: 10,
              letterSpacing: '0.08em',
            }}
          >
            {event.volume}
          </span>
        </a>

        <div className="flex items-center gap-1 sm:gap-6">
          {nav.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden md:inline-flex items-center"
              style={{
                color: 'var(--ss-text-dim)',
                fontSize: 13.5,
                fontWeight: 450,
                letterSpacing: '-0.005em',
                padding: '6px 4px',
                transition: 'color 160ms ease',
              }}
            >
              {l.label}
            </a>
          ))}

          {showAdmin && (
            <a
              href="/admin/registrations"
              className="hidden md:inline-flex items-center"
              style={{
                color: 'var(--ss-accent-hi)',
                fontSize: 13.5,
                fontWeight: 500,
                letterSpacing: '-0.005em',
                padding: '6px 4px',
              }}
            >
              后台
            </a>
          )}

          <a
            href={nav.cta.href}
            className="ss-btn ss-btn-ghost group"
            style={{ height: 34, padding: '0 14px', fontSize: 12.5 }}
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
            {nav.cta.label}
          </a>
        </div>
      </div>
    </nav>
  )
}
