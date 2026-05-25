import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { RESOURCE_STAGE_LABEL, RESOURCE_STAGE_ORDER } from '@/lib/db/resources'
import type { ResourceRow } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

export default async function AdminResourcesPage() {
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const { data, error } = await admin
    .from('resources')
    .select('*')
    .eq('event_id', event.id)
    .order('stage', { ascending: true })
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  const resources = (data ?? []) as ResourceRow[]

  return (
    <div className="ss-admin-container">
      <div className="ss-admin-title">资料库管理</div>
      <div className="ss-admin-sub">
        {event.name} · 共 {resources.length} 条资料。CRUD 下一阶段接入；当前先提供运营审阅和缺口检查。
      </div>

      {resources.length === 0 ? (
        <div className="ss-empty">暂无资料。可以先从 Supabase resources 表录入，前台 /resources 会自动按可见性展示。</div>
      ) : (
        <table className="ss-table">
          <thead>
            <tr>
              <th>阶段</th>
              <th>标题</th>
              <th>类型</th>
              <th>可见性</th>
              <th>排序</th>
              <th>链接</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id}>
                <td>{RESOURCE_STAGE_LABEL[r.stage]}</td>
                <td>
                  <div style={{ color: 'var(--ss-text-strong)', fontWeight: 500 }}>{r.title}</div>
                  {r.summary && <div style={{ color: 'var(--ss-text-dim)', fontSize: 13, marginTop: 4 }}>{r.summary}</div>}
                </td>
                <td style={{ color: 'var(--ss-text-dim)', fontSize: 13 }}>{r.type ?? '—'}</td>
                <td><span className="ss-chip">{r.visibility}</span></td>
                <td>{r.order_index}</td>
                <td>{r.url ? <a href={r.url} target="_blank" rel="noreferrer">打开</a> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="ss-admin-sub" style={{ marginTop: 18 }}>
        支持阶段：{RESOURCE_STAGE_ORDER.map(stage => RESOURCE_STAGE_LABEL[stage]).join(' / ')}；可见性：public / admitted_only。
        视频资料请将 type 设为 video，url 填腾讯云 VOD fileId。
      </div>
    </div>
  )
}
