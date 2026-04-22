import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFellowById } from '@/lib/db/fellows'

export const dynamic = 'force-dynamic'

export default async function FellowDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const admin = createAdminClient()
  const fellow = await getFellowById(admin, params.id)

  if (!fellow || fellow.visibility === 'private') notFound()
  if (fellow.registration?.status !== 'paid') notFound()

  return (
    <div className="ss-fellows-container" style={{ maxWidth: 720 }}>
      <div className="ss-topbar" style={{ marginBottom: 32 }}>
        <Link href="/fellows">← 同学录</Link>
      </div>

      <div className="ss-fellow-detail">
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--ss-text-strong)',
            marginBottom: 8,
          }}
        >
          {fellow.display_name}
        </h1>

        {fellow.one_liner && (
          <p style={{ color: 'var(--ss-text)', fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
            {fellow.one_liner}
          </p>
        )}

        <div className="ss-fellow-meta" style={{ marginBottom: 20 }}>
          {fellow.city && <span>{fellow.city}</span>}
          {fellow.tags.map(t => (
            <span key={t} className="ss-fellow-tag">{t}</span>
          ))}
        </div>

        {fellow.project_name && (
          <div style={{ marginTop: 24 }}>
            <div className="ss-eyebrow" style={{ marginBottom: 8 }}>项目</div>
            <div style={{
              color: 'var(--ss-accent-hi)',
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 10,
            }}>
              {fellow.project_name}
            </div>
            {fellow.project_intro && (
              <div className="ss-fellow-project">{fellow.project_intro}</div>
            )}
          </div>
        )}

        {fellow.links && fellow.links.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="ss-eyebrow" style={{ marginBottom: 8 }}>链接</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {fellow.links.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--ss-accent-hi)', textDecoration: 'underline' }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
