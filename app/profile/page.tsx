import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationByUser } from '@/lib/db/registrations'
import { getFellowByRegistration } from '@/lib/db/fellows'
import type { RegistrationStatus } from '@/lib/db/types'
import { ProfileForm } from './ProfileForm'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  submitted: '待审核',
  reviewing: '审核中',
  admitted: '已录取',
  waitlisted: '候补',
  rejected: '未录取',
  payment_pending: '待付款确认',
  paid: '已入营',
  withdrawn: '已退出',
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/profile')

  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const reg = await getRegistrationByUser(admin, user.id, event.id)
  const fellow = reg ? await getFellowByRegistration(admin, reg.id) : null
  const canEdit = Boolean(reg && ['admitted', 'payment_pending', 'paid'].includes(reg.status))

  return (
    <div className="ss-apply-container">
      <div className="ss-topbar">
        <Link href="/">← SoloShip</Link>
        <span>{user.email}</span>
      </div>

      <header className="ss-apply-header">
        <span className="ss-eyebrow">{event.name} · 个人资料</span>
        <h1 className="ss-apply-title">个人资料</h1>
        <p className="ss-apply-sub">
          管理你的同学录档案和可见性。
        </p>
      </header>

      <div className="ss-apply-card">
        <dl className="ss-kv" style={{ marginTop: 0 }}>
          <dt>邮箱</dt><dd>{user.email}</dd>
          {reg && (<><dt>报名状态</dt><dd>{STATUS_LABEL[reg.status]}</dd></>)}
          {reg?.name && (<><dt>姓名</dt><dd>{reg.name}</dd></>)}
          {reg?.city && (<><dt>城市</dt><dd>{reg.city}</dd></>)}
        </dl>

        {!reg && (
          <div className="ss-callout">
            你还没有提交报名。<Link href="/apply">去报名</Link>
          </div>
        )}

        {reg && !canEdit && (
          <div className="ss-callout">
            录取后可以在此编辑同学录档案。当前状态：{STATUS_LABEL[reg.status]}。
          </div>
        )}

        {canEdit && (
          <div style={{ marginTop: 28 }}>
            <div className="ss-eyebrow" style={{ marginBottom: 12 }}>同学录档案</div>
            <ProfileForm
              initial={{
                display_name: fellow?.display_name ?? reg!.name,
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
