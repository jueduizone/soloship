import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { listPublicFellows } from '@/lib/db/fellows'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = createAdminClient()
  try {
    const event = await getDefaultEvent(admin)
    const rows = await listPublicFellows(admin, event.id)
    const fellows = rows
      .filter(r => r.visibility !== 'private')
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
