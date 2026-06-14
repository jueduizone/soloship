import { NextResponse, type NextRequest } from 'next/server'
import { getOrganizerUser } from '@/lib/auth/require-organizer'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteResource, updateResource } from '@/lib/db/resources'
import type { ResourceStage, ResourceVisibility } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

const STAGES: ResourceStage[] = ['pre_camp', 'week_1', 'week_2', 'week_3', 'demo_day', 'post_camp']
const VISIBILITIES: ResourceVisibility[] = ['public', 'admitted_only']

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getOrganizerUser()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: '无效请求体' }, { status: 400 })
  const patch: Record<string, unknown> = {}
  if (typeof body.title === 'string') {
    const title = body.title.trim()
    if (!title) return NextResponse.json({ error: 'title 不能为空' }, { status: 400 })
    patch.title = title
  }
  if ('summary' in body) patch.summary = typeof body.summary === 'string' && body.summary.trim() ? body.summary.trim() : null
  if ('url' in body) patch.url = typeof body.url === 'string' && body.url.trim() ? body.url.trim() : null
  if ('type' in body) patch.type = typeof body.type === 'string' && body.type.trim() ? body.type.trim() : 'link'
  if (STAGES.includes(body.stage as ResourceStage)) patch.stage = body.stage
  if (VISIBILITIES.includes(body.visibility as ResourceVisibility)) patch.visibility = body.visibility
  if ('order_index' in body) patch.order_index = Number.isFinite(Number(body.order_index)) ? Math.trunc(Number(body.order_index)) : 0
  const row = await updateResource(createAdminClient(), params.id, patch)
  return NextResponse.json({ ok: true, resource: row })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getOrganizerUser()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  await deleteResource(createAdminClient(), params.id)
  return NextResponse.json({ ok: true })
}
