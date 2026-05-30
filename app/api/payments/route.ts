import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRegistrationById } from '@/lib/db/registrations'
import { getDefaultEvent } from '@/lib/db/events'
import { markPaymentPending } from '@/lib/db/payments'
import { getDictionary } from '@/lib/i18n'
import { normalizeLocale, SITE_LOCALE_COOKIE } from '@/lib/i18n/site'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const copy = getDictionary(normalizeLocale(request.cookies.get(SITE_LOCALE_COOKIE)?.value))
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: copy.common.api.loginRequired }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: copy.common.api.invalidBody }, { status: 400 })
  }

  const registrationId = typeof body.registration_id === 'string' ? body.registration_id : ''
  if (!registrationId) {
    return NextResponse.json({ error: copy.common.api.paymentMissingRegistration }, { status: 400 })
  }

  const admin = createAdminClient()
  const reg = await getRegistrationById(admin, registrationId)
  if (!reg) {
    return NextResponse.json({ error: copy.common.api.paymentRegistrationMissing }, { status: 404 })
  }
  if (reg.user_id !== user.id) {
    return NextResponse.json({ error: copy.common.api.forbidden }, { status: 403 })
  }
  if (reg.status !== 'admitted') {
    return NextResponse.json(
      { error: `${copy.common.api.paymentInvalidStatusPrefix}${reg.status}${copy.common.api.paymentInvalidStatusSuffix}` },
      { status: 400 }
    )
  }

  try {
    const event = await getDefaultEvent(admin)
    const row = await markPaymentPending(admin, reg.id, event.price_cents, event.currency)
    return NextResponse.json({ ok: true, payment: row })
  } catch (err) {
    const message = err instanceof Error ? err.message : copy.common.api.unknown
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
