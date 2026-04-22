import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { upsertRegistration } from '@/lib/db/registrations'
import type { LinkEntry } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

  const event_id = String(body.event_id ?? '').trim()
  const name = String(body.name ?? '').trim()
  if (!event_id || !name) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  // Always use the authenticated user's email — don't trust the client.
  const email = user.email
  if (!email) {
    return NextResponse.json({ error: '当前账号没有邮箱' }, { status: 400 })
  }

  const rawLinks = Array.isArray(body.links) ? body.links : []
  const links: LinkEntry[] = rawLinks
    .map((l): LinkEntry | null => {
      if (!l || typeof l !== 'object') return null
      const obj = l as Record<string, unknown>
      const url = typeof obj.url === 'string' ? obj.url.trim() : ''
      if (!url) return null
      const label = typeof obj.label === 'string' && obj.label.trim() ? obj.label.trim() : url
      return { label, url }
    })
    .filter((l): l is LinkEntry => l !== null)

  const admin = createAdminClient()
  try {
    const row = await upsertRegistration(admin, {
      event_id,
      user_id: user.id,
      name,
      email,
      city: typeof body.city === 'string' ? body.city : null,
      contact: typeof body.contact === 'string' ? body.contact : null,
      bio: typeof body.bio === 'string' ? body.bio : null,
      build_direction:
        typeof body.build_direction === 'string' ? body.build_direction : null,
      project_idea: typeof body.project_idea === 'string' ? body.project_idea : null,
      links,
    })
    return NextResponse.json({ ok: true, registration: row })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
