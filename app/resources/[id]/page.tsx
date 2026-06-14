import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isOrganizerUser } from '@/lib/auth/require-organizer'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import { RESOURCE_STAGE_LABEL, RESOURCE_STAGE_ORDER, getResourceById, listResourcesForViewer } from '@/lib/db/resources'
import type { ResourceRow } from '@/lib/db/types'
import { getCurrentLocale } from '@/lib/i18n/site'
import type { SiteLocale } from '@/app/_components/content'
import { CloudflareStreamPlayer } from './CloudflareStreamPlayer'

export const dynamic = 'force-dynamic'

const VOD_COPY: Record<SiteLocale, {
  backResources: string
  access: string
  paidOnlyTitle: string
  paidOnlyBody: string
  status: string
  resource: string
  open: string
  courseVideo: string
  lesson: (index: number) => string
  catalog: string
  allResources: string
  videosCount: (count: number) => string
  loading: string
  note: string
  types: Record<string, string>
  visibility: {
    admitted_only: string
    public: string
  }
  stages: Record<ResourceRow['stage'], string>
}> = {
  zh: {
    backResources: '← 资料库',
    access: 'Access',
    paidOnlyTitle: '仅已付费用户可观看',
    paidOnlyBody: '这节课程视频仅向已付费入营用户开放。完成付款确认后即可观看。',
    status: '查看申请状态',
    resource: 'Resource',
    open: '打开资料',
    courseVideo: 'Course Video',
    lesson: index => `第 ${index} 节`,
    catalog: '课程目录',
    allResources: '全部资料',
    videosCount: count => `${count} 节视频`,
    loading: '正在准备安全播放环境…',
    note: '本课程仅限已付费入营用户观看。页面带有账号水印，请勿录屏、转发或下载。',
    types: {
      video: '课程视频',
      link: '资料链接',
    },
    visibility: {
      admitted_only: '已入营可见',
      public: '公开可见',
    },
    stages: {
      pre_camp: '开营前',
      week_1: 'Week 1',
      week_2: 'Week 2',
      week_3: 'Week 3',
      demo_day: 'Demo Day',
      post_camp: '结营后',
    },
  },
  en: {
    backResources: '← Resources',
    access: 'Access',
    paidOnlyTitle: 'Paid members only',
    paidOnlyBody: 'This course video is available only to admitted builders whose payment has been confirmed.',
    status: 'View application status',
    resource: 'Resource',
    open: 'Open resource',
    courseVideo: 'Course Video',
    lesson: index => `Lesson ${index}`,
    catalog: 'Course Catalog',
    allResources: 'All resources',
    videosCount: count => `${count} video${count === 1 ? '' : 's'}`,
    loading: 'Preparing secure playback…',
    note: 'This course is only available to paid cohort members. The page includes an account watermark; please do not record, share, or download.',
    types: {
      video: 'Course video',
      link: 'Resource link',
    },
    visibility: {
      admitted_only: 'Admitted only',
      public: 'Public',
    },
    stages: {
      pre_camp: 'Before kickoff',
      week_1: 'Week 1',
      week_2: 'Week 2',
      week_3: 'Week 3',
      demo_day: 'Demo Day',
      post_camp: 'After cohort',
    },
  },
}

function groupVideosByStage(resources: ResourceRow[], copy: typeof VOD_COPY[SiteLocale]) {
  return RESOURCE_STAGE_ORDER.map(stage => ({
    stage,
    label: copy.stages[stage] ?? RESOURCE_STAGE_LABEL[stage],
    items: resources.filter(resource => resource.stage === stage && resource.type === 'video'),
  })).filter(group => group.items.length > 0)
}

export default async function ResourceDetailPage({ params }: { params: { id: string } }) {
  const copy = VOD_COPY[getCurrentLocale(cookies())]
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
  const groupedVideos = groupVideosByStage(resources, copy)
  const currentIndex = resources
    .filter(item => item.type === 'video')
    .findIndex(item => item.id === resource.id)

  if (!canAccess) {
    return (
      <div className="ss-apply-container">
        <div className="ss-resource-topbar">
          <Link href="/resources">{copy.backResources}</Link>
        </div>
        <div className="ss-apply-card" style={{ marginTop: 24 }}>
          <div className="ss-eyebrow">{copy.access}</div>
          <h1 className="ss-apply-title" style={{ marginTop: 8 }}>{copy.paidOnlyTitle}</h1>
          <p className="ss-apply-sub" style={{ marginTop: 12 }}>
            {copy.paidOnlyBody}
          </p>
          <Link href="/apply/status" className="ss-btn ss-btn-primary" style={{ marginTop: 18 }}>
            {copy.status}
          </Link>
        </div>
      </div>
    )
  }

  if (resource.type !== 'video') {
    return (
      <div className="ss-apply-container">
        <div className="ss-resource-topbar">
          <Link href="/resources">{copy.backResources}</Link>
        </div>
        <header className="ss-apply-header">
          <span className="ss-eyebrow">{copy.resource}</span>
          <h1 className="ss-apply-title">{resource.title}</h1>
          {resource.summary && <p className="ss-apply-sub">{resource.summary}</p>}
        </header>
        {resource.url && (
          <a className="ss-btn ss-btn-primary" href={resource.url} target="_blank" rel="noreferrer">
            {copy.open}
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="ss-apply-container ss-vod-container">
      <div className="ss-resource-topbar ss-vod-topbar">
        <Link href="/resources">{copy.backResources}</Link>
      </div>

      <div className="ss-vod-layout">
        <main className="ss-vod-main">
          <header className="ss-vod-header">
            <div className="ss-vod-kicker">
              <span>{copy.courseVideo}</span>
              {currentIndex >= 0 && <span>{copy.lesson(currentIndex + 1)}</span>}
            </div>
            <h1 className="ss-vod-title">{resource.title}</h1>
            {resource.summary && <p className="ss-vod-summary">{resource.summary}</p>}
          </header>

          <CloudflareStreamPlayer resourceId={resource.id} loadingLabel={copy.loading} securityNote={copy.note} />
        </main>

        <aside className="ss-vod-sidebar" aria-label={copy.catalog}>
          <div className="ss-vod-sidebar-head">
            <div>
              <div className="ss-vod-sidebar-title">{copy.catalog}</div>
              <div className="ss-vod-sidebar-sub">{copy.videosCount(groupedVideos.reduce((total, group) => total + group.items.length, 0))}</div>
            </div>
            <Link href="/resources">{copy.allResources}</Link>
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
                        <span className="ss-vod-playlist-meta">{copy.types[item.type ?? ''] ?? item.type ?? copy.resource} · {copy.visibility[item.visibility]}</span>
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
