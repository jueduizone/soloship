import { event, nav } from './content'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isOrganizerUser } from '@/lib/auth/require-organizer'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationForApplicant } from '@/lib/db/registrations'

export async function Nav() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const showAdmin = user ? isOrganizerUser(user) : false
  let showFellows = showAdmin

  if (user?.email && !showFellows) {
    const admin = createAdminClient()
    const currentEvent = await getDefaultEvent(admin)
    const registration = await getRegistrationForApplicant(admin, {
      userId: user.id,
      email: user.email,
      eventId: currentEvent.id,
    })
    showFellows = registration?.status === 'paid'
  }

  return (
    <nav
      className="sticky top-0 z-20"
      style={{
        background: 'rgba(3,7,5,0.78)',
        backdropFilter: 'saturate(140%) blur(14px)',
        WebkitBackdropFilter: 'saturate(140%) blur(14px)',
        borderBottom: '1px solid var(--ss-border-dark-soft)',
      }}
    >
      <div className="ss-container flex items-center justify-between" style={{ height: 60 }}>
        <a href="#top" className="flex items-center gap-3" aria-label={`${event.name} ${event.volume}`}>
          <img
            src="/assets/brand/soloship-logo.svg"
            alt={event.name}
            width={138}
            height={30}
            style={{ display: 'block', width: 120, height: 'auto' }}
          />
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

          {user && (
            <>
              <a
                href="/apply/status"
                className="hidden md:inline-flex items-center"
                style={{
                  color: 'var(--ss-text-dim)',
                  fontSize: 13.5,
                  fontWeight: 450,
                  letterSpacing: '-0.005em',
                  padding: '6px 4px',
                }}
              >
                申请状态
              </a>
              <a
                href="/resources"
                className="hidden md:inline-flex items-center"
                style={{
                  color: 'var(--ss-text-dim)',
                  fontSize: 13.5,
                  fontWeight: 450,
                  letterSpacing: '-0.005em',
                  padding: '6px 4px',
                }}
              >
                资料库
              </a>
            </>
          )}

          {showFellows && (
            <a
              href="/fellows"
              className="hidden md:inline-flex items-center"
              style={{
                color: 'var(--ss-text-dim)',
                fontSize: 13.5,
                fontWeight: 450,
                letterSpacing: '-0.005em',
                padding: '6px 4px',
              }}
            >
              同学录
            </a>
          )}

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
                boxShadow: '0 0 0 3px rgba(0,251,135,0.16), 0 0 18px rgba(0,251,135,0.52)',
              }}
            />
            {nav.cta.label}
          </a>
        </div>
      </div>
    </nav>
  )
}
