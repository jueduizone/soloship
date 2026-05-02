import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { RegistrationRow } from './types'

export type ParticipantAccess = {
  user: User | null
  registration: RegistrationRow | null
  isPaid: boolean
}

/**
 * Resolve the current user's cohort access for an event.
 * Uses admin/service client because user_id linking can lag for legacy imported rows;
 * falls back to authenticated email and only treats status=paid as cohort access.
 */
export async function getParticipantAccess(
  supabase: SupabaseClient,
  params: { user: User | null; eventId: string }
): Promise<ParticipantAccess> {
  if (!params.user) {
    return { user: null, registration: null, isPaid: false }
  }

  let query = supabase
    .from('registrations')
    .select('*')
    .eq('event_id', params.eventId)
    .or(`user_id.eq.${params.user.id},email.eq.${params.user.email ?? ''}`)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await query
  if (error) throw error

  const registration = (data as RegistrationRow | null) ?? null
  return {
    user: params.user,
    registration,
    isPaid: registration?.status === 'paid',
  }
}
