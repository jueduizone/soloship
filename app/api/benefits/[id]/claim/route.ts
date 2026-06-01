import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import { claimBenefit } from '@/lib/db/benefits'

export const dynamic = 'force-dynamic'

function cleanPayload(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const payload: Record<string, unknown> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw !== 'string') continue
    const trimmed = raw.trim()
    if (trimmed) payload[key] = trimmed.slice(0, 500)
  }
  return payload
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: '请先登录后领取福利' }, { status: 401 })
  }

  const admin = createAdminClient()

  try {
    const body = await request.json().catch(() => ({}))
    const benefit = await admin
      .from('benefits')
      .select('event_id')
      .eq('id', params.id)
      .maybeSingle()
    if (benefit.error) throw benefit.error
    if (!benefit.data) {
      return NextResponse.json({ error: '福利不存在' }, { status: 404 })
    }

    const registration = await getRegistrationForApplicant(admin, {
      userId: user.id,
      email: user.email,
      eventId: benefit.data.event_id,
    })
    if (!registration) {
      return NextResponse.json({ error: '未找到你的 SoloShip 报名记录' }, { status: 403 })
    }

    const result = await claimBenefit(admin, {
      benefitId: params.id,
      userId: user.id,
      registration,
      payload: cleanPayload(body.payload),
    })

    return NextResponse.json({
      ok: true,
      claim: result.claim,
      code: result.code,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '领取失败'
    const status = message.includes('已付费') ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
