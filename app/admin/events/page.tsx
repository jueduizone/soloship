import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { updateEventAction } from '../_actions'
import { AdminSubmitButton } from '../AdminSubmitButton'
import type { EventStatus } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

const STATUSES: EventStatus[] = ['draft', 'recruiting', 'reviewing', 'running', 'finished']

export default async function AdminEventsPage() {
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)

  return (
    <div className="ss-admin-container">
      <div className="ss-admin-title">活动配置</div>
      <div className="ss-admin-sub">当前仅维护 {event.slug} 的基础配置；FAQ JSON 后置。</div>
      <section className="ss-panel">
        <form action={updateEventAction} className="ss-form-stack">
          <input type="hidden" name="id" value={event.id} />
          <div className="ss-field"><label>状态</label><select className="ss-select" name="status" defaultValue={event.status}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="ss-field"><label>容量</label><input className="ss-input" name="capacity" type="number" defaultValue={event.capacity ?? ''} placeholder="不限留空" /></div>
          <div className="ss-field"><label>价格（元）</label><input className="ss-input" name="price_yuan" type="number" step="0.01" defaultValue={(event.price_cents / 100).toFixed(2)} /></div>
          <div className="ss-field"><label>开始日期</label><input className="ss-input" name="start_date" type="date" defaultValue={event.start_date ?? ''} /></div>
          <div className="ss-field"><label>结束日期</label><input className="ss-input" name="end_date" type="date" defaultValue={event.end_date ?? ''} /></div>
          <div className="ss-field"><label>Demo Day</label><input className="ss-input" name="demo_day_date" type="date" defaultValue={event.demo_day_date ?? ''} /></div>
          <AdminSubmitButton idleLabel="保存配置" pendingLabel="正在保存…" />
        </form>
      </section>
    </div>
  )
}
