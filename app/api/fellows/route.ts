import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/auth/require-admin'
import { getDefaultEvent } from '@/lib/db/events'
import { listPublicFellows, type FellowListItem } from '@/lib/db/fellows'
import { getRegistrationForApplicant } from '@/lib/db/registrations'

export const dynamic = 'force-dynamic'

function canViewFellow(
  fellow: FellowListItem,
  viewer: { userId?: string; isCohort: boolean; isAdmin: boolean }
) {
  if (viewer.isAdmin) return true
  if (fellow.visibility === 'public') return true
  if (fellow.visibility === 'cohort_only') return viewer.isCohort
  return Boolean(viewer.userId && fellow.registration?.user_id === viewer.userId)
}

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
    const isCohort = registration?.status === 'paid'
    const isAdmin = user ? isAdminUser(user) : false
    const rows = await listPublicFellows(admin, event.id)
    const fellows = rows
      .filter(r => canViewFellow(r, { userId: user?.id, isCohort, isAdmin }))
      .map(r => ({
        id: r.id,
        display_name: r.display_name,
        avatar_url: r.avatar_url,
        one_liner: r.one_liner,
        city: r.city,
        tags: r.tags,
        project_name: r.project_name,
        visibility: r.visibility,
      }))
    return NextResponse.json({ ok: true, fellows })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
