import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { listAdminFellows } from '@/lib/db/fellows'

export const dynamic = 'force-dynamic'

export default async function AdminFellowsPage() {
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const fellows = await listAdminFellows(admin, event.id)

  return (
    <div className="ss-admin-container">
      <div className="ss-admin-title">同学录管理</div>
      <div className="ss-admin-sub">
        {event.name} · 共 {fellows.length} 个 profile。发布/隐藏编辑动作下一阶段接入 API；当前先提供运营审阅入口。
      </div>

      {fellows.length === 0 ? (
        <div className="ss-empty">暂无同学录资料。</div>
      ) : (
        <table className="ss-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>报名人</th>
              <th>项目</th>
              <th>可见性</th>
              <th>发布</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {fellows.map(f => (
              <tr key={f.id}>
                <td style={{ color: 'var(--ss-text-strong)', fontWeight: 500 }}>{f.display_name}</td>
                <td style={{ color: 'var(--ss-text-dim)', fontSize: 13 }}>{f.registration?.name ?? '—'}<br />{f.registration?.email ?? ''}</td>
                <td style={{ color: 'var(--ss-text-dim)', fontSize: 13 }}>{f.project_name ?? '—'}</td>
                <td><span className="ss-chip">{f.visibility}</span></td>
                <td>{f.published ? '已发布' : '隐藏'}</td>
                <td style={{ color: 'var(--ss-text-faint)', fontSize: 12 }}>{new Date(f.updated_at).toLocaleString('zh-CN')}</td>
                <td>
                  <Link className="ss-table-action" href={`/fellows/${f.id}`}>查看</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
