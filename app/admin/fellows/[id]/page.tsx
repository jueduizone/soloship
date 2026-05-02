import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFellowById } from '@/lib/db/fellows'
import { updateFellowAction } from '../../_actions'
import type { ProfileVisibility } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

const VISIBILITY: ProfileVisibility[] = ['public', 'cohort_only', 'private']

export default async function AdminFellowDetailPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient()
  const fellow = await getFellowById(admin, params.id)
  if (!fellow) notFound()

  return (
    <div className="ss-admin-container">
      <Link href="/admin/fellows" className="ss-back-link">← 返回同学录</Link>
      <div className="ss-admin-title">{fellow.display_name}</div>
      <div className="ss-admin-sub">{fellow.registration?.email ?? '无邮箱'} · {fellow.registration?.status ?? '无报名状态'}</div>

      <div className="ss-detail-grid">
        <section className="ss-panel">
          <h3>档案信息</h3>
          <dl className="ss-kv">
            <dt>项目</dt><dd>{fellow.project_name ?? '—'}</dd>
            <dt>一句话</dt><dd>{fellow.one_liner ?? '—'}</dd>
            <dt>城市</dt><dd>{fellow.city ?? '—'}</dd>
            <dt>标签</dt><dd>{fellow.tags?.join(', ') || '—'}</dd>
            <dt>简介</dt><dd>{fellow.project_intro ?? '—'}</dd>
            <dt>链接</dt><dd>{fellow.links?.map(l => <div key={l.url}><a href={l.url} target="_blank">{l.label || l.url}</a></div>) || '—'}</dd>
          </dl>
        </section>
        <aside className="ss-panel">
          <h3>运营设置</h3>
          <form action={updateFellowAction} className="ss-form-stack">
            <input type="hidden" name="id" value={fellow.id} />
            <div className="ss-field">
              <label>可见性</label>
              <select className="ss-select" name="visibility" defaultValue={fellow.visibility}>
                {VISIBILITY.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="ss-field">
              <label>发布状态</label>
              <select className="ss-select" name="published" defaultValue={String(fellow.published)}>
                <option value="true">已发布</option>
                <option value="false">已隐藏</option>
              </select>
            </div>
            <button className="ss-btn-action is-primary" type="submit">保存</button>
          </form>
        </aside>
      </div>
    </div>
  )
}
