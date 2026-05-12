import Link from 'next/link'

import { LogoutButton } from './LogoutButton'
import { NavCta } from './NavCta'
import { event, nav } from './content'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isOrganizerUser } from '@/lib/auth/require-organizer'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationForApplicant } from '@/lib/db/registrations'

function resolveHomeAnchor(href: string) {
  return href.startsWith('#') ? `/${href}` : href
}

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
      <div className="ss-container flex items-center justify-between" style={{ height: 52 }}>
        <Link href="/#top" className="flex items-center gap-3" aria-label={`${event.name} ${event.volume}`}>
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
        </Link>

        <div className="flex items-center gap-1 sm:gap-6">
          {nav.links.map((l) => (
            <Link
              key={l.href}
              href={resolveHomeAnchor(l.href)}
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
            </Link>
          ))}

          {user && (
            <>
              <Link
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
              </Link>
              <Link
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
              </Link>
            </>
          )}

          {showFellows && (
            <Link
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
            </Link>
          )}

          {showAdmin && (
            <Link
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
            </Link>
          )}

          <NavCta
            href={user ? nav.cta.href : `/auth/login?next=${encodeURIComponent(nav.cta.href)}`}
            label={nav.cta.label}
          />

          {user && <LogoutButton />}
        </div>
      </div>
    </nav>
  )
}
