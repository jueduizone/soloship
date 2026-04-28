import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationByUser } from '@/lib/db/registrations'
import { t } from '@/lib/i18n'
import { ApplyForm } from './ApplyForm'

export const dynamic = 'force-dynamic'

export default async function ApplyPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/apply')
  }

  const event = await getDefaultEvent(supabase)
  const existing = await getRegistrationByUser(supabase, user.id, event.id)

  // Already submitted and not in an editable state → go to status page
  if (existing && !['submitted', 'reviewing'].includes(existing.status)) {
    redirect('/apply/status')
  }

  return (
    <div className="ss-apply-container">
      <div className="ss-topbar">
        <Link href="/">← SoloShip</Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/apply/status">查看申请状态</Link>
          <span>{user.email}</span>
        </div>
      </div>

      <header className="ss-apply-header">
        <span className="ss-eyebrow">{event.name} · {event.subtitle}</span>
        <h1 className="ss-apply-title">{t.apply.title}</h1>
        <p className="ss-apply-sub">{t.apply.subtitle}</p>
      </header>

      <div className="ss-apply-card">
        <div className="ss-apply-steps">
          <span className="is-done">1 提交申请</span>
          <span>2 审核 / 录取</span>
          <span>3 付款 / 入营</span>
        </div>

        <div className="ss-callout" style={{ marginBottom: 24 }}>
          提交后会进入申请状态页。之后用当前登录邮箱进入「查看申请状态」即可查询审核结果、付款确认和入营进度。
        </div>

        {existing && (
          <div className="ss-callout" style={{ marginBottom: 24 }}>
            你已提交过申请，当前仍可修改。若不需要修改，可直接查看
            <Link href="/apply/status" style={{ marginLeft: 4, textDecoration: 'underline' }}>
              申请状态
            </Link>
            。
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
        />
      </div>
    </div>
  )
}
