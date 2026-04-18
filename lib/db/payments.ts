import type { SupabaseClient } from '@supabase/supabase-js'
import type { PaymentConfirmationRow } from './types'
import { updateRegistrationStatus } from './registrations'

/**
 * 标记「已通知付款」：把用户从 admitted → payment_pending。
 * 通常在运营发送付款通知后调用。service_role only。
 */
export async function markPaymentPending(
  supabase: SupabaseClient,
  registrationId: string,
  amountCents: number,
  currency = 'CNY'
): Promise<PaymentConfirmationRow> {
  const { data, error } = await supabase
    .from('payment_confirmations')
    .insert({
      registration_id: registrationId,
      amount_cents: amountCents,
      currency,
      status: 'pending',
    })
    .select('*')
    .single()
  if (error) throw error

  await updateRegistrationStatus(supabase, registrationId, 'payment_pending')
  return data as PaymentConfirmationRow
}

/**
 * 人工确认到账。把对应 payment_confirmation 改成 confirmed，
 * 并把 registration 推进到 paid。service_role only。
 */
export async function confirmPayment(
  supabase: SupabaseClient,
  params: {
    paymentId: string
    confirmedBy: string | null
    channel?: string | null
    externalRef?: string | null
    screenshotUrl?: string | null
    note?: string | null
  }
): Promise<PaymentConfirmationRow> {
  const { data, error } = await supabase
    .from('payment_confirmations')
    .update({
      status: 'confirmed',
      confirmed_by: params.confirmedBy,
      confirmed_at: new Date().toISOString(),
      channel: params.channel ?? undefined,
      external_ref: params.externalRef ?? undefined,
      screenshot_url: params.screenshotUrl ?? undefined,
      note: params.note ?? undefined,
    })
    .eq('id', params.paymentId)
    .select('*')
    .single()
  if (error) throw error

  const payment = data as PaymentConfirmationRow
  await updateRegistrationStatus(supabase, payment.registration_id, 'paid')
  return payment
}

export async function getLatestPaymentForRegistration(
  supabase: SupabaseClient,
  registrationId: string
): Promise<PaymentConfirmationRow | null> {
  const { data, error } = await supabase
    .from('payment_confirmations')
    .select('*')
    .eq('registration_id', registrationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as PaymentConfirmationRow | null
}
