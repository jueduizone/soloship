import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { RESOURCE_STAGE_LABEL, RESOURCE_STAGE_ORDER } from '@/lib/db/resources'
import { createResourceAction, updateResourceAction } from '@/app/admin/_actions'
import { AdminSubmitButton } from '@/app/admin/AdminSubmitButton'
import type { ResourceRow } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

const RESOURCE_VISIBILITIES = [
  { value: 'admitted_only', label: '已入营可见' },
  { value: 'public', label: '公开可见' },
] as const

const RESOURCE_TYPES = [
  { value: 'video', label: '课程视频' },
  { value: 'link', label: '资料链接' },
] as const

function ResourceFields({ resource }: { resource?: ResourceRow }) {
  return (
    <>
      <input type="hidden" name="id" value={resource?.id ?? ''} />
      <div className="ss-field ss-resource-title-field">
        <label htmlFor={resource ? `title-${resource.id}` : 'title-new'}>标题</label>
        <input
          id={resource ? `title-${resource.id}` : 'title-new'}
          className="ss-input"
          name="title"
          defaultValue={resource?.title ?? ''}
          placeholder="例如：Week 1 开营回放"
          required
        />
      </div>
      <div className="ss-field ss-resource-summary-field">
        <label htmlFor={resource ? `summary-${resource.id}` : 'summary-new'}>描述</label>
        <textarea
          id={resource ? `summary-${resource.id}` : 'summary-new'}
          className="ss-textarea"
          name="summary"
          defaultValue={resource?.summary ?? ''}
          placeholder="给学员看的简短说明，会展示在播放列表和视频页。"
        />
      </div>
      <div className="ss-field ss-resource-url-field">
        <label htmlFor={resource ? `url-${resource.id}` : 'url-new'}>链接 / Video UID</label>
        <input
          id={resource ? `url-${resource.id}` : 'url-new'}
          className="ss-input"
          name="url"
          defaultValue={resource?.url ?? ''}
          placeholder="Cloudflare Stream UID 或资料 URL"
        />
      </div>
      <div className="ss-field ss-resource-type-field">
        <label htmlFor={resource ? `type-${resource.id}` : 'type-new'}>类型</label>
        <select
          id={resource ? `type-${resource.id}` : 'type-new'}
          className="ss-select"
          name="type"
          defaultValue={resource?.type ?? 'video'}
        >
          {RESOURCE_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div className="ss-field ss-resource-stage-field">
        <label htmlFor={resource ? `stage-${resource.id}` : 'stage-new'}>阶段</label>
        <select
          id={resource ? `stage-${resource.id}` : 'stage-new'}
          className="ss-select"
          name="stage"
          defaultValue={resource?.stage ?? 'week_1'}
        >
          {RESOURCE_STAGE_ORDER.map(stage => (
            <option key={stage} value={stage}>{RESOURCE_STAGE_LABEL[stage]}</option>
          ))}
        </select>
      </div>
      <div className="ss-field ss-resource-visibility-field">
        <label htmlFor={resource ? `visibility-${resource.id}` : 'visibility-new'}>可见性</label>
        <select
          id={resource ? `visibility-${resource.id}` : 'visibility-new'}
          className="ss-select"
          name="visibility"
          defaultValue={resource?.visibility ?? 'admitted_only'}
        >
          {RESOURCE_VISIBILITIES.map(visibility => (
            <option key={visibility.value} value={visibility.value}>{visibility.label}</option>
          ))}
        </select>
      </div>
      <div className="ss-field ss-resource-order-field">
        <label htmlFor={resource ? `order-${resource.id}` : 'order-new'}>排序</label>
        <input
          id={resource ? `order-${resource.id}` : 'order-new'}
          className="ss-input"
          name="order_index"
          type="number"
          defaultValue={resource?.order_index ?? 0}
        />
      </div>
    </>
  )
}

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
        {event.name} · 共 {resources.length} 条资料。课程视频会出现在前台 /resources 播放列表，已付费学员点击后进入播放页。
      </div>

      <section className="ss-panel ss-resource-admin-panel">
        <h3>新增课程 / 资料</h3>
        <form action={createResourceAction} className="ss-resource-form">
          <ResourceFields />
          <div className="ss-resource-actions">
            <AdminSubmitButton idleLabel="新增" pendingLabel="新增中" />
          </div>
        </form>
      </section>

      {resources.length === 0 ? (
        <div className="ss-empty">暂无资料。可以在上方新增课程视频或资料链接，前台 /resources 会自动按可见性展示。</div>
      ) : (
        <div className="ss-resource-list">
          {resources.map(r => (
            <section className="ss-panel ss-resource-admin-panel" key={r.id}>
              <div className="ss-resource-admin-head">
                <div>
                  <div className="ss-resource-admin-title">{r.title}</div>
                  <div className="ss-admin-sub" style={{ marginBottom: 0 }}>
                    {RESOURCE_STAGE_LABEL[r.stage]} · {r.type === 'video' ? '课程视频' : r.type ?? '资料'} · {r.visibility}
                  </div>
                </div>
                {r.type === 'video' ? (
                  <a className="ss-table-action" href={`/resources/${r.id}`} target="_blank" rel="noreferrer">预览</a>
                ) : r.url ? (
                  <a className="ss-table-action" href={r.url} target="_blank" rel="noreferrer">打开</a>
                ) : null}
              </div>
              <form action={updateResourceAction} className="ss-resource-form">
                <ResourceFields resource={r} />
                <div className="ss-resource-actions">
                  <AdminSubmitButton idleLabel="保存" pendingLabel="保存中" />
                </div>
              </form>
            </section>
          ))}
        </div>
      )}

      <div className="ss-admin-sub" style={{ marginTop: 18 }}>
        支持阶段：{RESOURCE_STAGE_ORDER.map(stage => RESOURCE_STAGE_LABEL[stage]).join(' / ')}；可见性：public / admitted_only。
        视频资料请将 type 设为 video，url 填 Cloudflare Stream video UID。
      </div>
    </div>
  )
}
