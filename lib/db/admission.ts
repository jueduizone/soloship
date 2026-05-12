import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  AdmissionDecisionKind,
  AdmissionDecisionRow,
  RegistrationRow,
  RegistrationStatus,
} from './types'
import { getRegistrationById, updateRegistrationStatus } from './registrations'

const STATUS_BY_DECISION: Record<AdmissionDecisionKind, RegistrationStatus> = {
  admit: 'admitted',
  waitlist: 'waitlisted',
  reject: 'rejected',
}

/**
 * 记录一次审核决策并同步推进 registration.status。
 * service_role only（绕 RLS + auth.users FK 约束）。
 */
export async function recordAdmissionDecision(
  supabase: SupabaseClient,
  params: {
    registrationId: string
    reviewerId: string | null
    decision: AdmissionDecisionKind
    note?: string | null
  }
): Promise<{ decision: AdmissionDecisionRow; registration: RegistrationRow }> {
  const previous = await getRegistrationById(supabase, params.registrationId)
  if (!previous) throw new Error('报名不存在')

  const registration = await updateRegistrationStatus(
    supabase,
    params.registrationId,
    STATUS_BY_DECISION[params.decision],
    params.note ?? null
  )

  const { data, error } = await supabase
    .from('admission_decisions')
    .insert({
      registration_id: params.registrationId,
      reviewer_id: params.reviewerId,
      decision: params.decision,
      note: params.note ?? null,
    })
    .select('*')
    .single()
  if (error) {
    await updateRegistrationStatus(
      supabase,
      params.registrationId,
      previous.status,
      previous.reviewer_note
    ).catch(() => null)
    throw error
  }

  return {
    decision: data as AdmissionDecisionRow,
    registration,
  }
}

export async function listAdmissionDecisions(
  supabase: SupabaseClient,
  registrationId: string
): Promise<AdmissionDecisionRow[]> {
  const { data, error } = await supabase
    .from('admission_decisions')
    .select('*')
    .eq('registration_id', registrationId)
    .order('decided_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AdmissionDecisionRow[]
}
