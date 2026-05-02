import { NextResponse, type NextRequest } from 'next/server'
import { getOrganizerUser } from '@/lib/auth/require-organizer'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { createResource, listResources } from '@/lib/db/resources'
import type { ResourceStage, ResourceVisibility } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

const STAGES: ResourceStage[] = ['pre_camp', 'week_1', 'week_2', 'demo_day', 'post_camp']
const VISIBILITIES: ResourceVisibility[] = ['public', 'admitted_only']

export async function GET() {
  const user = await getOrganizerUser()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  return NextResponse.json({ ok: true, resources: await listResources(admin, event.id) })
}

export async function POST(request: NextRequest) {
  const user = await getOrganizerUser()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'title 不能为空' }, { status: 400 })
  }
  const stage = STAGES.includes(body.stage as ResourceStage) ? body.stage as ResourceStage : 'pre_camp'
  const visibility = VISIBILITIES.includes(body.visibility as ResourceVisibility) ? body.visibility as ResourceVisibility : 'admitted_only'
  const row = await createResource(admin, {
    event_id: event.id,
    title: body.title.trim(),
    summary: typeof body.summary === 'string' && body.summary.trim() ? body.summary.trim() : null,
    url: typeof body.url === 'string' && body.url.trim() ? body.url.trim() : null,
    type: typeof body.type === 'string' && body.type.trim() ? body.type.trim() : 'link',
    stage,
    visibility,
    order_index: Number.isFinite(Number(body.order_index)) ? Math.trunc(Number(body.order_index)) : 0,
  })
  return NextResponse.json({ ok: true, resource: row }, { status: 201 })
}
