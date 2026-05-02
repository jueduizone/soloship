import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationByUser } from '@/lib/db/registrations'
import { upsertFellowProfile } from '@/lib/db/fellows'
import type { LinkEntry, ProfileVisibility } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

function normalizeHttpUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '无效的请求体' }, { status: 400 })
  }

  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const reg = await getRegistrationByUser(admin, user.id, event.id)
  if (!reg) {
    return NextResponse.json({ error: '未找到报名记录' }, { status: 404 })
  }
  const eligible = ['admitted', 'payment_pending', 'paid'].includes(reg.status)
  if (!eligible) {
    return NextResponse.json(
      { error: '录取后才能编辑个人资料' },
      { status: 400 }
    )
  }

  const rawLinks = Array.isArray(body.links) ? body.links : []
  const links: LinkEntry[] = []
  for (const l of rawLinks) {
    if (!l || typeof l !== 'object') continue
    const obj = l as Record<string, unknown>
    const rawUrl = typeof obj.url === 'string' ? obj.url : ''
    const url = normalizeHttpUrl(rawUrl)
    if (url === null) {
      return NextResponse.json({ error: `链接格式不正确：${rawUrl}` }, { status: 400 })
    }
    if (!url) continue
    const label = typeof obj.label === 'string' && obj.label.trim() ? obj.label.trim() : url
    links.push({ label, url })
  }

  const avatarRaw = typeof body.avatar_url === 'string' ? body.avatar_url : ''
  const avatarUrl = normalizeHttpUrl(avatarRaw)
  if (avatarUrl === null) {
    return NextResponse.json({ error: '头像 URL 格式不正确' }, { status: 400 })
  }

  const tags = Array.isArray(body.tags)
    ? (body.tags as unknown[])
        .map(t => (typeof t === 'string' ? t.trim() : ''))
        .filter(Boolean)
    : undefined

  const vis = body.visibility
  const visibility: ProfileVisibility | undefined =
    vis === 'public' || vis === 'cohort_only' || vis === 'private'
      ? vis
      : undefined

  try {
    const row = await upsertFellowProfile(
      admin,
      reg.id,
      event.id,
      { display_name: reg.name },
      {
        display_name:
          typeof body.display_name === 'string' && body.display_name.trim()
            ? body.display_name.trim()
            : undefined,
        avatar_url: avatarUrl || null,
        one_liner: typeof body.one_liner === 'string' ? body.one_liner : undefined,
        city: typeof body.city === 'string' ? body.city : undefined,
        tags,
        project_name:
          typeof body.project_name === 'string' ? body.project_name : undefined,
        project_intro:
          typeof body.project_intro === 'string' ? body.project_intro : undefined,
        links,
        visibility,
      }
    )
    return NextResponse.json({ ok: true, profile: row })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
