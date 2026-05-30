import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationByUser } from '@/lib/db/registrations'
import { getDictionary } from '@/lib/i18n'
import { getCurrentLocale } from '@/lib/i18n/site'
import { ApplyForm } from './ApplyForm'

export const dynamic = 'force-dynamic'

export default async function ApplyPage({
  searchParams,
}: {
  searchParams?: { edit?: string }
}) {
  const copy = getDictionary(getCurrentLocale(cookies()))
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/apply')
  }

  const event = await getDefaultEvent(supabase)
  const existing = await getRegistrationByUser(supabase, user.id, event.id)
  const wantsEdit = searchParams?.edit === '1'

  // Existing registration → status page is the default landing.
  // Submitted/reviewing applicants can still edit via an explicit ?edit=1.
  if (existing) {
    const editable = existing.status === 'submitted' || existing.status === 'reviewing'
    if (!editable || !wantsEdit) {
      redirect('/apply/status')
    }
  }

  return (
    <div className="ss-apply-container">
      <div className="ss-topbar">
        <Link href="/">← SoloShip</Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/apply/status">{copy.apply.topbarStatus}</Link>
          <span>{user.email}</span>
        </div>
      </div>

      <header className="ss-apply-header">
        <span className="ss-eyebrow">{event.name} · {event.subtitle}</span>
        <h1 className="ss-apply-title">{copy.apply.title}</h1>
        <p className="ss-apply-sub">{copy.apply.subtitle}</p>
      </header>

      <div className="ss-apply-card">
        <div className="ss-apply-steps">
          <span className="is-done">{copy.apply.steps.submit}</span>
          <span>{copy.apply.steps.review}</span>
          <span>{copy.apply.steps.payment}</span>
        </div>

        <div className="ss-callout" style={{ marginBottom: 24 }}>
          {copy.apply.callout}
        </div>

        {existing && (
          <div className="ss-callout" style={{ marginBottom: 24 }}>
            {copy.apply.editCalloutPrefix}
            <Link href="/apply/status" style={{ marginLeft: 4, textDecoration: 'underline' }}>
              {copy.apply.editCalloutLink}
            </Link>
            {copy.apply.editCalloutSuffix}
          </div>
        )}

        <ApplyForm
          eventId={event.id}
          initial={existing ? {
            name: existing.name,
            city: existing.city ?? '',
            contact: existing.contact ?? '',
            bio: existing.bio ?? '',
            build_direction: existing.build_direction ?? '',
            project_idea: existing.project_idea ?? '',
            links: (existing.links ?? []).map(l => l.url).join('\n'),
          } : {
            name: (user.user_metadata as Record<string, string>)?.full_name
              ?? (user.user_metadata as Record<string, string>)?.name
              ?? '',
            city: '',
            contact: '',
            bio: '',
            build_direction: '',
            project_idea: '',
            links: '',
          }}
          email={user.email ?? ''}
          isUpdate={Boolean(existing)}
          copy={copy}
        />
      </div>
    </div>
  )
}
