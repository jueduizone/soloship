import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isOrganizerUser } from '@/lib/auth/require-organizer'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import { listResourcesForViewer } from '@/lib/db/resources'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()

  try {
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
    const rows = await listResourcesForViewer(admin, event.id, { canSeeAdmittedOnly })
    const resources = rows.map(resource => ({
      id: resource.id,
      title: resource.title,
      summary: resource.summary,
      url: resource.type === 'video' ? null : resource.url,
      type: resource.type,
      stage: resource.stage,
      visibility: resource.visibility,
      order_index: resource.order_index,
    }))
    return NextResponse.json({ ok: true, resources, canSeeAdmittedOnly })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
