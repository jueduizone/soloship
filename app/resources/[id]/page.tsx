import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isOrganizerUser } from '@/lib/auth/require-organizer'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import { RESOURCE_STAGE_LABEL, RESOURCE_STAGE_ORDER, getResourceById, listResourcesForViewer } from '@/lib/db/resources'
import type { ResourceRow } from '@/lib/db/types'
import { CloudflareStreamPlayer } from './CloudflareStreamPlayer'

export const dynamic = 'force-dynamic'

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  video: '课程视频',
  link: '资料链接',
}

function groupVideosByStage(resources: ResourceRow[]) {
  return RESOURCE_STAGE_ORDER.map(stage => ({
    stage,
    label: RESOURCE_STAGE_LABEL[stage],
    items: resources.filter(resource => resource.stage === stage && resource.type === 'video'),
  })).filter(group => group.items.length > 0)
}

export default async function ResourceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=/resources/${params.id}`)
  }

  const admin = createAdminClient()
  const resource = await getResourceById(admin, params.id)
  if (!resource) notFound()

  const registration = user.email
    ? await getRegistrationForApplicant(admin, {
        userId: user.id,
        email: user.email,
        eventId: resource.event_id,
      })
    : null
  const canAccess = registration?.status === 'paid' || isOrganizerUser(user)
  const resources = await listResourcesForViewer(admin, resource.event_id, {
    canSeeAdmittedOnly: canAccess,
  })
  const groupedVideos = groupVideosByStage(resources)
  const currentIndex = resources
    .filter(item => item.type === 'video')
    .findIndex(item => item.id === resource.id)

  if (!canAccess) {
    return (
      <div className="ss-apply-container">
        <div className="ss-topbar">
          <Link href="/resources">← 资料库</Link>
          <span>{user.email}</span>
        </div>
        <div className="ss-apply-card" style={{ marginTop: 24 }}>
          <div className="ss-eyebrow">Access</div>
          <h1 className="ss-apply-title" style={{ marginTop: 8 }}>仅已付费用户可观看</h1>
          <p className="ss-apply-sub" style={{ marginTop: 12 }}>
            这节课程视频仅向已付费入营用户开放。完成付款确认后即可观看。
          </p>
          <Link href="/apply/status" className="ss-btn ss-btn-primary" style={{ marginTop: 18 }}>
            查看申请状态
          </Link>
        </div>
      </div>
    )
  }

  if (resource.type !== 'video') {
    return (
      <div className="ss-apply-container">
        <div className="ss-topbar">
          <Link href="/resources">← 资料库</Link>
          <span>{user.email}</span>
        </div>
        <header className="ss-apply-header">
          <span className="ss-eyebrow">Resource</span>
          <h1 className="ss-apply-title">{resource.title}</h1>
          {resource.summary && <p className="ss-apply-sub">{resource.summary}</p>}
        </header>
        {resource.url && (
          <a className="ss-btn ss-btn-primary" href={resource.url} target="_blank" rel="noreferrer">
            打开资料
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="ss-apply-container ss-vod-container">
      <div className="ss-topbar ss-vod-topbar">
        <Link href="/resources">← 资料库</Link>
        <span>{user.email}</span>
      </div>

      <div className="ss-vod-layout">
        <main className="ss-vod-main">
          <header className="ss-vod-header">
            <div className="ss-vod-kicker">
              <span>Course Video</span>
              {currentIndex >= 0 && <span>第 {currentIndex + 1} 节</span>}
            </div>
            <h1 className="ss-vod-title">{resource.title}</h1>
            {resource.summary && <p className="ss-vod-summary">{resource.summary}</p>}
          </header>

          <CloudflareStreamPlayer resourceId={resource.id} />
        </main>

        <aside className="ss-vod-sidebar" aria-label="课程目录">
          <div className="ss-vod-sidebar-head">
            <div>
              <div className="ss-vod-sidebar-title">课程目录</div>
              <div className="ss-vod-sidebar-sub">{groupedVideos.reduce((total, group) => total + group.items.length, 0)} 节视频</div>
            </div>
            <Link href="/resources">全部资料</Link>
          </div>

          <div className="ss-vod-playlist">
            {groupedVideos.map(group => (
              <section className="ss-vod-playlist-stage" key={group.stage}>
                <h2>{group.label}</h2>
                <div className="ss-vod-playlist-items">
                  {group.items.map((item, index) => (
                    <Link
                      key={item.id}
                      href={`/resources/${item.id}`}
                      className="ss-vod-playlist-item"
                      aria-current={item.id === resource.id ? 'page' : undefined}
                    >
                      <span className="ss-vod-playlist-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="ss-vod-playlist-copy">
                        <span className="ss-vod-playlist-title">{item.title}</span>
                        <span className="ss-vod-playlist-meta">{RESOURCE_TYPE_LABELS[item.type ?? ''] ?? item.type ?? '资料'} · {item.visibility === 'admitted_only' ? '已入营可见' : '公开可见'}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
