import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import { listResourcesForViewer } from '@/lib/db/resources'
import type { ResourceRow, ResourceStage, ResourceVisibility } from '@/lib/db/types'
import { isOrganizerUser } from '@/lib/auth/require-organizer'
import { getCurrentLocale } from '@/lib/i18n/site'
import type { SiteLocale } from '@/app/_components/content'

export const dynamic = 'force-dynamic'

const STAGE_ORDER: ResourceStage[] = ['pre_camp', 'week_1', 'week_2', 'week_3', 'demo_day', 'post_camp']
const RESOURCE_COPY: Record<SiteLocale, {
  backHome: string
  login: string
  eyebrow: string
  title: string
  subtitle: string
  access: string
  accessGranted: string
  accessPublicOnly: string
  accessAnonymous: string
  empty: string
  emptyStage: string
  watch: string
  open: string
  stages: Record<ResourceStage, string>
  visibility: Record<ResourceVisibility, string>
  types: Record<string, string>
}> = {
  zh: {
    backHome: '← SoloShip',
    login: '登录查看权限',
    eyebrow: 'SoloShip Vol.1 · Resources',
    title: '课程播放列表',
    subtitle: '这里按阶段整理课程视频和共学资料。Public 资料任何人可看；Admitted Only 资料仅已入营学员和组织者可见。',
    access: 'Access',
    accessGranted: '你当前可以查看 Public 和 Admitted Only 资料。',
    accessPublicOnly: '你当前只能查看 Public 资料。付款确认为已入营后会开放入营资料。',
    accessAnonymous: '登录后可查看你可访问的资料范围。未登录时仅展示 Public 资料。',
    empty: '暂无可访问资料。开营资料整理好后会出现在这里。',
    emptyStage: '本阶段暂无可访问资料。',
    watch: '观看课程 →',
    open: '打开资料 ↗',
    stages: {
      pre_camp: '开营前',
      week_1: 'Week 1',
      week_2: 'Week 2',
      week_3: 'Week 3',
      demo_day: 'Demo Day',
      post_camp: '结营后',
    },
    visibility: {
      public: 'Public',
      admitted_only: 'Admitted Only',
    },
    types: {
      video: '课程视频',
      link: '资料链接',
    },
  },
  en: {
    backHome: '← SoloShip',
    login: 'Log in for access',
    eyebrow: 'SoloShip Vol.1 · Resources',
    title: 'Course Playlist',
    subtitle: 'Course videos and shared materials are organized by stage. Public resources are open to everyone; Admitted Only resources are available to admitted builders and organizers.',
    access: 'Access',
    accessGranted: 'You can currently access Public and Admitted Only resources.',
    accessPublicOnly: 'You can currently access Public resources only. Admitted resources unlock after payment is confirmed.',
    accessAnonymous: 'Log in to see your access level. Anonymous visitors only see Public resources.',
    empty: 'No accessible resources yet. Materials will appear here after they are ready.',
    emptyStage: 'No accessible resources in this stage.',
    watch: 'Watch course →',
    open: 'Open resource ↗',
    stages: {
      pre_camp: 'Before kickoff',
      week_1: 'Week 1',
      week_2: 'Week 2',
      week_3: 'Week 3',
      demo_day: 'Demo Day',
      post_camp: 'After cohort',
    },
    visibility: {
      public: 'Public',
      admitted_only: 'Admitted Only',
    },
    types: {
      video: 'Course video',
      link: 'Resource link',
    },
  },
}

function groupByStage(resources: ResourceRow[]): Record<ResourceStage, ResourceRow[]> {
  return STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = resources.filter(resource => resource.stage === stage)
    return acc
  }, {} as Record<ResourceStage, ResourceRow[]>)
}

export default async function ResourcesPage() {
  const locale = getCurrentLocale(cookies())
  const copy = RESOURCE_COPY[locale]
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const registration = user?.email
    ? await getRegistrationForApplicant(admin, {
        userId: user.id,
        email: user.email,
        eventId: event.id,
      })
    : null
  const canSeeAdmittedOnly = Boolean(
    registration?.status === 'paid' ||
    (user && isOrganizerUser(user))
  )
  const resources = await listResourcesForViewer(admin, event.id, { canSeeAdmittedOnly })
  const grouped = groupByStage(resources)
  const hasResources = resources.length > 0

  return (
    <div className="ss-apply-container">
      <div className="ss-resource-topbar">
        <Link href="/">{copy.backHome}</Link>
        {!user && <Link href="/auth/login?next=/resources">{copy.login}</Link>}
      </div>

      <header className="ss-apply-header">
        <span className="ss-eyebrow">{copy.eyebrow}</span>
        <h1 className="ss-apply-title">{copy.title}</h1>
        <p className="ss-apply-sub">
          {copy.subtitle}
        </p>
      </header>

      <div className="ss-apply-card ss-resource-access">
        <div>
          <div className="ss-eyebrow">{copy.access}</div>
          <p className="ss-apply-sub" style={{ marginTop: 8 }}>
            {canSeeAdmittedOnly
              ? copy.accessGranted
              : user
                ? copy.accessPublicOnly
                : copy.accessAnonymous}
          </p>
        </div>
        {!user && (
          <Link href="/auth/login?next=/resources" className="ss-btn ss-btn-primary">
            {copy.login}
          </Link>
        )}
      </div>

      {!hasResources && (
        <div className="ss-apply-card" style={{ marginTop: 24 }}>
          <div className="ss-callout" style={{ marginTop: 0 }}>
            {copy.empty}
          </div>
        </div>
      )}

      {hasResources && STAGE_ORDER.map(stage => (
        <section className="ss-resource-stage" key={stage}>
          <h2 className="ss-resource-stage-title">{copy.stages[stage]}</h2>
          {grouped[stage].length > 0 ? (
            <div className="ss-resource-grid">
              {grouped[stage].map(resource => (
                <article className="ss-resource-card" key={resource.id}>
                  <div className="ss-resource-card-header">
                    <h3 className="ss-resource-title">{resource.title}</h3>
                    <div className="ss-resource-meta">
                      {resource.type && <span className="ss-resource-pill">{copy.types[resource.type] ?? resource.type}</span>}
                      <span className="ss-resource-pill" data-visibility={resource.visibility}>
                        {copy.visibility[resource.visibility]}
                      </span>
                    </div>
                  </div>
                  {resource.summary && <p className="ss-resource-summary">{resource.summary}</p>}
                  {resource.type === 'video' ? (
                    <Link className="ss-resource-link" href={`/resources/${resource.id}`}>
                      {copy.watch}
                    </Link>
                  ) : resource.url && (
                    <a className="ss-resource-link" href={resource.url} target="_blank" rel="noreferrer">
                      {copy.open}
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="ss-resource-empty-stage">{copy.emptyStage}</div>
          )}
        </section>
      ))}
    </div>
  )
}
