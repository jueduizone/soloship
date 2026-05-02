import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { listRegistrations } from '@/lib/db/registrations'
import type { RegistrationStatus } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

const METRICS: Array<{ label: string; statuses: RegistrationStatus[] }> = [
  { label: '总报名', statuses: ['submitted', 'reviewing', 'admitted', 'waitlisted', 'rejected', 'payment_pending', 'paid', 'withdrawn'] },
  { label: '待审核', statuses: ['submitted', 'reviewing'] },
  { label: '已录取', statuses: ['admitted'] },
  { label: '待付款', statuses: ['payment_pending'] },
  { label: '已入营', statuses: ['paid'] },
  { label: '候补/拒绝', statuses: ['waitlisted', 'rejected'] },
]

async function countByStatuses(eventId: string, statuses: RegistrationStatus[]) {
  const admin = createAdminClient()
  const { total } = await listRegistrations(admin, {
    eventId,
    status: statuses,
    limit: 1,
  })
  return total
}

export default async function AdminDashboardPage() {
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const counts = await Promise.all(METRICS.map(m => countByStatuses(event.id, m.statuses)))

  const [{ count: fellowCount }, { count: resourceCount }] = await Promise.all([
    admin.from('fellow_profiles').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
    admin.from('resources').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
  ])

  return (
    <div className="ss-admin-container">
      <div className="ss-admin-title">运营后台</div>
      <div className="ss-admin-sub">
        {event.name} · {event.subtitle} — 当前阶段：{event.status}
      </div>

      <div className="ss-admin-metrics">
        {METRICS.map((metric, index) => (
          <Link
            key={metric.label}
            href={metric.label === '总报名' ? '/admin/registrations' : `/admin/registrations?filter=${metric.label === '待审核' ? 'pending' : metric.label === '已录取' ? 'admitted' : metric.label === '待付款' ? 'payment_pending' : metric.label === '已入营' ? 'paid' : metric.label === '候补/拒绝' ? 'waitlisted' : 'all'}`}
            className="ss-admin-metric-card"
          >
            <span>{metric.label}</span>
            <strong>{counts[index]}</strong>
          </Link>
        ))}
      </div>

      <div className="ss-admin-quick-grid">
        <Link href="/admin/registrations" className="ss-panel ss-admin-quick-card">
          <h3>报名审核</h3>
          <p>查看报名列表、审核录取/候补/拒绝，并确认付款。</p>
          <span>进入报名管理 →</span>
        </Link>
        <Link href="/admin/fellows" className="ss-panel ss-admin-quick-card">
          <h3>同学录管理</h3>
          <p>当前 {fellowCount ?? 0} 个 profile。查看发布状态、visibility 和项目资料。</p>
          <span>进入同学录管理 →</span>
        </Link>
        <Link href="/admin/resources" className="ss-panel ss-admin-quick-card">
          <h3>资料库管理</h3>
          <p>当前 {resourceCount ?? 0} 条资料。按阶段和可见性检查资料库内容。</p>
          <span>进入资料库管理 →</span>
        </Link>
      </div>
    </div>
  )
}
