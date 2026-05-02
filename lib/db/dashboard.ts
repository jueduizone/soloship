import type { SupabaseClient } from '@supabase/supabase-js'
import type { RegistrationStatus } from './types'

export type AdminDashboardCounts = Record<
  'total' | 'pending' | 'admitted' | 'payment_pending' | 'paid' | 'waitlisted' | 'rejected',
  number
>

export async function getAdminDashboardCounts(
  supabase: SupabaseClient,
  eventId: string
): Promise<AdminDashboardCounts> {
  const { data, error } = await supabase
    .from('registrations')
    .select('status')
    .eq('event_id', eventId)
  if (error) throw error

  const statuses = (data ?? []).map(r => r.status as RegistrationStatus)
  return {
    total: statuses.length,
    pending: statuses.filter(s => s === 'submitted' || s === 'reviewing').length,
    admitted: statuses.filter(s => s === 'admitted').length,
    payment_pending: statuses.filter(s => s === 'payment_pending').length,
    paid: statuses.filter(s => s === 'paid').length,
    waitlisted: statuses.filter(s => s === 'waitlisted').length,
    rejected: statuses.filter(s => s === 'rejected').length,
  }
}
