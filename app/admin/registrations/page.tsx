import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getDefaultEvent } from '@/lib/db/events'
import { listRegistrations } from '@/lib/db/registrations'
import {
  ADMIN_REGISTRATION_STATUS_FILTERS,
  ADMIN_REGISTRATION_STATUS_LABEL,
} from '@/lib/admin/registration-status'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

export default async function RegistrationsListPage({
  searchParams,
}: {
  searchParams: { filter?: string; q?: string; page?: string }
}) {
  await requireAdmin()
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)

  const filterKey = searchParams.filter ?? 'all'
  const filter = ADMIN_REGISTRATION_STATUS_FILTERS.find(f => f.key === filterKey) ?? ADMIN_REGISTRATION_STATUS_FILTERS[0]
  const page = Math.max(1, Number(searchParams.page ?? '1') || 1)
  const offset = (page - 1) * PAGE_SIZE
  const q = searchParams.q?.trim() ?? ''

  const { rows, total } = await listRegistrations(admin, {
    eventId: event.id,
    status: filter.values,
    search: q || undefined,
    limit: PAGE_SIZE,
    offset,
  })

  const statusCounts = new Map<string, number>()
  await Promise.all(ADMIN_REGISTRATION_STATUS_FILTERS.map(async f => {
    const { total: count } = await listRegistrations(admin, {
      eventId: event.id,
      status: f.values,
      search: q || undefined,
      limit: 1,
    })
    statusCounts.set(f.key, count)
  }))

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hrefWith = (patch: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams()
    const keep = { filter: filterKey, q, page: String(page), ...patch }
    for (const [k, v] of Object.entries(keep)) {
      if (v !== undefined && v !== '' && v !== 'all') sp.set(k, String(v))
    }
    const s = sp.toString()
    return s ? `/admin/registrations?${s}` : '/admin/registrations'
  }

  return (
    <div className="ss-admin-container">
      <div className="ss-admin-title">报名管理</div>
      <div className="ss-admin-sub">
        {event.name} · {event.subtitle} — 共 {total} 条 · 点击「审核」进入录取 / 候补 / 拒绝 / 付款确认
      </div>

      <div className="ss-filters">
        <form action="/admin/registrations" method="GET">
          <input type="hidden" name="filter" value={filterKey} />
          <input
            name="q"
            className="ss-input"
            placeholder="搜姓名 / 邮箱 / 项目"
            defaultValue={q}
          />
        </form>

        <div className="ss-chip-row">
          {ADMIN_REGISTRATION_STATUS_FILTERS.map(f => (
            <Link
              key={f.key}
              href={hrefWith({ filter: f.key, page: undefined })}
              className={`ss-chip ${f.key === filterKey ? 'is-active' : ''}`}
            >
              {f.label}<span className="ss-chip-count">{statusCounts.get(f.key) ?? 0}</span>
            </Link>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="ss-empty">没有符合条件的报名。</div>
      ) : (
        <table className="ss-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>邮箱</th>
              <th>城市</th>
              <th>联系方式</th>
              <th>状态</th>
              <th>提交时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>
                  <Link href={`/admin/registrations/${r.id}`}>
                    <div style={{ color: 'var(--ss-text-strong)', fontWeight: 500 }}>{r.name}</div>
                  </Link>
                </td>
                <td style={{ color: 'var(--ss-text-dim)', fontSize: 13 }}>{r.email}</td>
                <td style={{ color: 'var(--ss-text-dim)', fontSize: 13 }}>{r.city ?? '—'}</td>
                <td style={{ color: 'var(--ss-text-dim)', fontSize: 13 }}>{r.contact ?? '—'}</td>
                <td>
                  <span className="ss-status-pill" data-kind={r.status}>
                    {ADMIN_REGISTRATION_STATUS_LABEL[r.status]}
                  </span>
                </td>
                <td style={{ color: 'var(--ss-text-faint)', fontSize: 12 }}>
                  {new Date(r.submitted_at).toLocaleString('zh-CN')}
                </td>
                <td>
                  <Link className="ss-table-action" href={`/admin/registrations/${r.id}`}>
                    审核
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="ss-pager">
        <div>第 {page} / {lastPage} 页</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            className={page <= 1 ? 'is-disabled' : ''}
            href={hrefWith({ page: page - 1 })}
          >
            上一页
          </Link>
          <Link
            className={page >= lastPage ? 'is-disabled' : ''}
            href={hrefWith({ page: page + 1 })}
          >
            下一页
          </Link>
        </div>
      </div>
    </div>
  )
}
