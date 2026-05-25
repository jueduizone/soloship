import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isOrganizerUser } from '@/lib/auth/require-organizer'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import { getResourceById } from '@/lib/db/resources'
import { CloudflareStreamPlayer } from './CloudflareStreamPlayer'

export const dynamic = 'force-dynamic'

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
    <div className="ss-apply-container">
      <div className="ss-topbar">
        <Link href="/resources">← 资料库</Link>
        <span>{user.email}</span>
      </div>

      <header className="ss-apply-header">
        <span className="ss-eyebrow">Course Video</span>
        <h1 className="ss-apply-title">{resource.title}</h1>
        {resource.summary && <p className="ss-apply-sub">{resource.summary}</p>}
      </header>

      <CloudflareStreamPlayer resourceId={resource.id} />
    </div>
  )
}
