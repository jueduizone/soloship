import { NextResponse, type NextRequest } from 'next/server'
import { getAdminUser } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  confirmPayment,
  getLatestPaymentForRegistration,
  markPaymentPending,
} from '@/lib/db/payments'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 })

  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: '无效请求体' }, { status: 400 }) }

  const action = body.action
  const client = createAdminClient()

  try {
    if (action === 'notify') {
      const cents = Number(body.amount_cents)
      if (!Number.isFinite(cents) || cents <= 0) {
        return NextResponse.json({ error: '金额无效' }, { status: 400 })
      }
      const currency = typeof body.currency === 'string' ? body.currency : 'CNY'
      const row = await markPaymentPending(client, params.id, cents, currency)
      return NextResponse.json({ ok: true, payment: row })
    }

    if (action === 'confirm') {
      const paymentId = typeof body.payment_id === 'string' ? body.payment_id : null
      if (!paymentId) {
        return NextResponse.json({ error: '缺少 payment_id' }, { status: 400 })
      }
      const row = await confirmPayment(client, {
        paymentId,
        confirmedBy: admin.id,
        channel: typeof body.channel === 'string' ? body.channel : null,
        externalRef: typeof body.external_ref === 'string' ? body.external_ref : null,
        screenshotUrl:
          typeof body.screenshot_url === 'string' ? body.screenshot_url : null,
        note: typeof body.note === 'string' ? body.note : null,
      })
      return NextResponse.json({ ok: true, payment: row })
    }

    return NextResponse.json({ error: '无效 action' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 })

  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: '无效请求体' }, { status: 400 }) }

  const status = body.status
  const client = createAdminClient()

  try {
    if (status === 'confirmed') {
      const payment = await getLatestPaymentForRegistration(client, params.id)
      if (!payment) {
        return NextResponse.json({ error: '没有可确认的付款记录' }, { status: 400 })
      }
      const row = await confirmPayment(client, {
        paymentId: payment.id,
        confirmedBy: admin.id,
        channel: typeof body.channel === 'string' ? body.channel : payment.channel,
        externalRef:
          typeof body.external_ref === 'string' ? body.external_ref : null,
        note: typeof body.note === 'string' ? body.note : null,
      })
      return NextResponse.json({ ok: true, payment: row })
    }

    return NextResponse.json({ error: '不支持的 status' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
