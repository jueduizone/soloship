import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isOrganizerUser } from '@/lib/auth/require-organizer'
import { getFellowById, type FellowListItem } from '@/lib/db/fellows'
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

export default async function FellowDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const copy = getDictionary(getCurrentLocale(cookies()))
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()
  const fellow = await getFellowById(admin, params.id)

  if (!fellow || !fellow.published) notFound()
  if (fellow.registration?.status !== 'paid') notFound()

  const registration = user?.email
    ? await getRegistrationForApplicant(admin, {
        userId: user.id,
        email: user.email,
        eventId: fellow.event_id,
      })
    : null
  const isOrganizer = user ? isOrganizerUser(user) : false
  const isCohort = registration?.status === 'paid'

  if (!canViewFellow(fellow, { userId: user?.id, isCohort, isOrganizer })) notFound()

  return (
    <div className="ss-fellows-container" style={{ maxWidth: 720 }}>
      <div className="ss-topbar" style={{ marginBottom: 32 }}>
        <Link href="/fellows">{copy.fellows.back}</Link>
        {user?.id === fellow.registration?.user_id && <Link href="/profile">{copy.fellows.editProfile}</Link>}
      </div>

      <div className="ss-fellow-detail">
        <div className="ss-fellow-detail-head">
          {fellow.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="ss-fellow-avatar ss-fellow-avatar-lg" src={fellow.avatar_url} alt={`${fellow.display_name} avatar`} />
          ) : (
            <div className="ss-fellow-avatar ss-fellow-avatar-lg ss-fellow-avatar-fallback" aria-hidden>{initials(fellow.display_name)}</div>
          )}
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--ss-text-strong)',
                marginBottom: 8,
              }}
            >
              {fellow.display_name}
            </h1>
            {fellow.visibility !== 'public' && <div className="ss-fellow-visibility">{copy.fellows.cohortOnly}</div>}
          </div>
        </div>

        {fellow.one_liner && (
          <p style={{ color: 'var(--ss-text)', fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
            {fellow.one_liner}
          </p>
        )}

        <div className="ss-fellow-meta" style={{ marginBottom: 20 }}>
          {fellow.city && <span>{fellow.city}</span>}
          {fellow.tags.map(t => (
            <span key={t} className="ss-fellow-tag">{t}</span>
          ))}
        </div>

        {fellow.project_name && (
          <div style={{ marginTop: 24 }}>
            <div className="ss-eyebrow" style={{ marginBottom: 8 }}>{copy.fellows.project}</div>
            <div style={{
              color: 'var(--ss-accent-hi)',
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 10,
            }}>
              {fellow.project_name}
            </div>
            {fellow.project_intro && (
              <div className="ss-fellow-project">{fellow.project_intro}</div>
            )}
          </div>
        )}

        {fellow.links && fellow.links.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="ss-eyebrow" style={{ marginBottom: 8 }}>{copy.fellows.links}</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {fellow.links.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--ss-accent-hi)', textDecoration: 'underline' }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
