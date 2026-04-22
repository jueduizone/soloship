import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRegistrationById } from '@/lib/db/registrations'
import { getDefaultEvent } from '@/lib/db/events'
import { markPaymentPending } from '@/lib/db/payments'

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

  const registrationId = typeof body.registration_id === 'string' ? body.registration_id : ''
  if (!registrationId) {
    return NextResponse.json({ error: '缺少 registration_id' }, { status: 400 })
  }

  const admin = createAdminClient()
  const reg = await getRegistrationById(admin, registrationId)
  if (!reg) {
    return NextResponse.json({ error: '报名不存在' }, { status: 404 })
  }
  if (reg.user_id !== user.id) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }
  if (reg.status !== 'admitted') {
    return NextResponse.json(
      { error: `当前状态 ${reg.status} 不能提交付款` },
      { status: 400 }
    )
  }

  try {
    const event = await getDefaultEvent(admin)
    const row = await markPaymentPending(admin, reg.id, event.price_cents, event.currency)
    return NextResponse.json({ ok: true, payment: row })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
