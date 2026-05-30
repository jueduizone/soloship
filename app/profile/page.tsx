import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import { getFellowByRegistration } from '@/lib/db/fellows'
import { getDictionary } from '@/lib/i18n'
import { getCurrentLocale } from '@/lib/i18n/site'
import { ProfileForm } from './ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const copy = getDictionary(getCurrentLocale(cookies()))
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/profile')

  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const reg = user.email
    ? await getRegistrationForApplicant(admin, {
        userId: user.id,
        email: user.email,
        eventId: event.id,
      })
    : null
  const fellow = reg ? await getFellowByRegistration(admin, reg.id) : null
  const canEdit = Boolean(reg && ['admitted', 'payment_pending', 'paid'].includes(reg.status))

  return (
    <div className="ss-apply-container">
      <div className="ss-topbar">
        <Link href="/">← SoloShip</Link>
        <span>{user.email}</span>
      </div>

      <header className="ss-apply-header">
        <span className="ss-eyebrow">{event.name} · {copy.profile.eyebrow}</span>
        <h1 className="ss-apply-title">{copy.profile.title}</h1>
        <p className="ss-apply-sub">
          {copy.profile.subtitle}
        </p>
      </header>

      <div className="ss-apply-card">
        <dl className="ss-kv" style={{ marginTop: 0 }}>
          <dt>{copy.profile.fields.email}</dt><dd>{user.email}</dd>
          {reg && (<><dt>{copy.profile.fields.status}</dt><dd>{copy.apply.status.labels[reg.status]}</dd></>)}
          {reg?.name && (<><dt>{copy.profile.fields.name}</dt><dd>{reg.name}</dd></>)}
          {reg?.city && (<><dt>{copy.profile.fields.city}</dt><dd>{reg.city}</dd></>)}
        </dl>

        {!reg && (
          <div className="ss-callout">
            {copy.profile.noRegistration}<Link href="/apply">{copy.profile.goApply}</Link>
          </div>
        )}

        {reg && !canEdit && (
          <div className="ss-callout">
            {copy.profile.lockedPrefix}{copy.apply.status.labels[reg.status]}{copy.profile.lockedSuffix}
          </div>
        )}

        {fellow && (
          <div className="ss-callout" style={{ marginTop: 16 }}>
            {copy.profile.existing}<Link href={`/fellows/${fellow.id}`}>{copy.profile.viewMine}</Link>
          </div>
        )}

        {reg?.status === 'paid' && (
          <div className="ss-callout">
            {copy.profile.resourcesOpen}<Link href="/resources">{copy.profile.enterResources}</Link>
          </div>
        )}

        {canEdit && (
          <div style={{ marginTop: 28 }}>
            <div className="ss-eyebrow" style={{ marginBottom: 12 }}>{copy.profile.formTitle}</div>
            <ProfileForm
              copy={copy}
              initial={{
                id: fellow?.id,
                display_name: fellow?.display_name ?? reg!.name,
                avatar_url: fellow?.avatar_url ?? '',
                one_liner: fellow?.one_liner ?? '',
                city: fellow?.city ?? reg!.city ?? '',
                tags: (fellow?.tags ?? []).join(', '),
                project_name: fellow?.project_name ?? '',
                project_intro: fellow?.project_intro ?? '',
                links: (fellow?.links ?? []).map(l => l.url).join('\n'),
                visibility: fellow?.visibility ?? 'cohort_only',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
