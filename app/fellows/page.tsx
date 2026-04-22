import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { listPublicFellows } from '@/lib/db/fellows'

export const dynamic = 'force-dynamic'

export default async function FellowsPage() {
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const fellows = (await listPublicFellows(admin, event.id)).filter(
    f => f.visibility !== 'private'
  )

  return (
    <div className="ss-fellows-container">
      <div className="ss-topbar" style={{ marginBottom: 32 }}>
        <Link href="/">← SoloShip</Link>
      </div>

      <header className="ss-fellows-header">
        <span className="ss-eyebrow">同学录 · {event.name}</span>
        <h1 className="ss-fellows-title">{event.name} 同学录</h1>
        <p className="ss-fellows-sub">
          已正式入营的 builder。点进去看每个人在 ship 什么。
        </p>
      </header>

      {fellows.length === 0 ? (
        <div className="ss-fellows-empty">
          还没有公开的同学档案。录取后可见。
        </div>
      ) : (
        <div className="ss-fellows-grid">
          {fellows.map(f => (
            <Link key={f.id} href={`/fellows/${f.id}`} className="ss-fellow-card">
              <div className="ss-fellow-name">{f.display_name}</div>
              {f.one_liner && <div className="ss-fellow-one">{f.one_liner}</div>}
              {f.project_name && (
                <div style={{ color: 'var(--ss-accent-hi)', fontSize: 13 }}>
                  {f.project_name}
                </div>
              )}
              <div className="ss-fellow-meta">
                {f.city && <span>{f.city}</span>}
                {f.tags.slice(0, 3).map(t => (
                  <span key={t} className="ss-fellow-tag">{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
