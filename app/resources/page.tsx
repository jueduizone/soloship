import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import { listResourcesForViewer } from '@/lib/db/resources'
import type { ResourceRow, ResourceStage, ResourceVisibility } from '@/lib/db/types'
import { isOrganizerUser } from '@/lib/auth/require-organizer'

export const dynamic = 'force-dynamic'

const STAGE_ORDER: ResourceStage[] = ['pre_camp', 'week_1', 'week_2', 'demo_day', 'post_camp']
const STAGE_LABELS: Record<ResourceStage, string> = {
  pre_camp: '开营前',
  week_1: 'Week 1',
  week_2: 'Week 2',
  demo_day: 'Demo Day',
  post_camp: '结营后',
}
const VISIBILITY_LABELS: Record<ResourceVisibility, string> = {
  public: 'Public',
  admitted_only: 'Admitted Only',
}

function groupByStage(resources: ResourceRow[]): Record<ResourceStage, ResourceRow[]> {
  return STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = resources.filter(resource => resource.stage === stage)
    return acc
  }, {} as Record<ResourceStage, ResourceRow[]>)
}

export default async function ResourcesPage() {
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
      <div className="ss-topbar">
        <Link href="/">← SoloShip</Link>
        {user ? <span>{user.email}</span> : <Link href="/auth/login?next=/resources">登录</Link>}
      </div>

      <header className="ss-apply-header">
        <span className="ss-eyebrow">{event.name} · Resources</span>
        <h1 className="ss-apply-title">资料库</h1>
        <p className="ss-apply-sub">
          这里按阶段整理共学营资料。Public 资料任何人可看；Admitted Only 资料仅已入营学员和组织者可见。
        </p>
      </header>

      <div className="ss-apply-card ss-resource-access">
        <div>
          <div className="ss-eyebrow">Access</div>
          <p className="ss-apply-sub" style={{ marginTop: 8 }}>
            {canSeeAdmittedOnly
              ? '你当前可以查看 Public 和 Admitted Only 资料。'
              : user
                ? '你当前只能查看 Public 资料。付款确认为已入营后会开放入营资料。'
                : '登录后可查看你可访问的资料范围。未登录时仅展示 Public 资料。'}
          </p>
        </div>
        {!user && (
          <Link href="/auth/login?next=/resources" className="ss-btn ss-btn-primary">
            登录查看权限
          </Link>
        )}
      </div>

      {!hasResources && (
        <div className="ss-apply-card" style={{ marginTop: 24 }}>
          <div className="ss-callout" style={{ marginTop: 0 }}>
            暂无可访问资料。开营资料整理好后会出现在这里。
          </div>
        </div>
      )}

      {hasResources && STAGE_ORDER.map(stage => (
        <section className="ss-resource-stage" key={stage}>
          <h2 className="ss-resource-stage-title">{STAGE_LABELS[stage]}</h2>
          {grouped[stage].length > 0 ? (
            <div className="ss-resource-grid">
              {grouped[stage].map(resource => (
                <article className="ss-resource-card" key={resource.id}>
                  <div className="ss-resource-card-header">
                    <h3 className="ss-resource-title">{resource.title}</h3>
                    <div className="ss-resource-meta">
                      {resource.type && <span className="ss-resource-pill">{resource.type}</span>}
                      <span className="ss-resource-pill" data-visibility={resource.visibility}>
                        {VISIBILITY_LABELS[resource.visibility]}
                      </span>
                    </div>
                  </div>
                  {resource.summary && <p className="ss-resource-summary">{resource.summary}</p>}
                  {resource.type === 'video' ? (
                    <Link className="ss-resource-link" href={`/resources/${resource.id}`}>
                      观看课程 →
                    </Link>
                  ) : resource.url && (
                    <a className="ss-resource-link" href={resource.url} target="_blank" rel="noreferrer">
                      打开资料 ↗
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="ss-resource-empty-stage">本阶段暂无可访问资料。</div>
          )}
        </section>
      ))}
    </div>
  )
}
