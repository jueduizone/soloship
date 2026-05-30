import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isOrganizerUser } from '@/lib/auth/require-organizer'
import { getDefaultEvent } from '@/lib/db/events'
import { listPublicFellows, type FellowListItem } from '@/lib/db/fellows'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import { getDictionary } from '@/lib/i18n'
import { getCurrentLocale } from '@/lib/i18n/site'

export const dynamic = 'force-dynamic'

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || 'SS'
}

function canViewFellow(
  fellow: FellowListItem,
  viewer: { userId?: string; isCohort: boolean; isOrganizer: boolean }
) {
  if (viewer.isOrganizer) return true
  if (fellow.visibility === 'public') return true
  if (fellow.visibility === 'cohort_only') return viewer.isCohort
  return Boolean(viewer.userId && fellow.registration?.user_id === viewer.userId)
}

export default async function FellowsPage() {
  const copy = getDictionary(getCurrentLocale(cookies()))
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const registration = user?.email
    ? await getRegistrationForApplicant(admin, {
        userId: user.id,
        email: user.email,
        eventId: event.id,
      })
    : null
  const isOrganizer = user ? isOrganizerUser(user) : false
  const isCohort = registration?.status === 'paid'
  const fellows = (await listPublicFellows(admin, event.id)).filter(f =>
    canViewFellow(f, { userId: user?.id, isCohort, isOrganizer })
  )

  const emptyText = !user
    ? copy.fellows.emptyAnonymous
    : !isCohort && !isOrganizer
      ? copy.fellows.emptyPublicOnly
      : copy.fellows.emptyCohort

  return (
    <div className="ss-fellows-container">
      <div className="ss-topbar" style={{ marginBottom: 32 }}>
        <Link href="/">← SoloShip</Link>
        {isCohort || isOrganizer ? <Link href="/profile">{copy.fellows.editProfile}</Link> : null}
      </div>

      <header className="ss-fellows-header">
        <span className="ss-eyebrow">{copy.fellows.eyebrow} · {event.name}</span>
        <h1 className="ss-fellows-title">{event.name} {copy.fellows.titleSuffix}</h1>
        <p className="ss-fellows-sub">
          {copy.fellows.subtitle}
        </p>
      </header>

      {!user && (
        <div className="ss-callout" style={{ marginBottom: 24 }}>
          {copy.fellows.anonymousCallout}<Link href="/auth/login?next=/fellows">{copy.fellows.loginScope}</Link>
        </div>
      )}

      {user && !isCohort && !isOrganizer && (
        <div className="ss-callout" style={{ marginBottom: 24 }}>
          {copy.fellows.publicOnlyCallout}<Link href="/apply/status">{copy.fellows.viewStatus}</Link>
        </div>
      )}

      {fellows.length === 0 ? (
        <div className="ss-fellows-empty">{emptyText}</div>
      ) : (
        <div className="ss-fellows-grid">
          {fellows.map(f => (
            <Link key={f.id} href={`/fellows/${f.id}`} className="ss-fellow-card">
              <div className="ss-fellow-card-head">
                {f.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="ss-fellow-avatar" src={f.avatar_url} alt={`${f.display_name} avatar`} />
                ) : (
                  <div className="ss-fellow-avatar ss-fellow-avatar-fallback" aria-hidden>{initials(f.display_name)}</div>
                )}
                <div>
                  <div className="ss-fellow-name">{f.display_name}</div>
                  {f.visibility !== 'public' && <div className="ss-fellow-visibility">{copy.fellows.cohortOnly}</div>}
                </div>
              </div>
              {f.one_liner && <div className="ss-fellow-one">{f.one_liner}</div>}
              {f.project_name && (
                <div style={{ color: 'var(--ss-accent-hi)', fontSize: 13 }}>
                  {f.project_name}
                </div>
              )}
              <div className="ss-fellow-meta">
                {f.city && <span>{f.city}</span>}
                {f.tags.slice(0, 3).map(t => (
                  <span key={t} className="ss-fellow-tag">{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
