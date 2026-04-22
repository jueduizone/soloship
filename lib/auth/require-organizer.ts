import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from './require-admin'

/**
 * Gate server components / route handlers to organizers + admins.
 * Organizer = user_metadata.role === 'organizer'. Admins also pass.
 *
 * 非授权用户 → 踢去 /。未登录 → 踢去 /auth/login。
 */
export async function requireOrganizer(): Promise<User> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin/registrations')
  if (!isOrganizerUser(user)) redirect('/')
  return user
}

export async function getOrganizerUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if (!isOrganizerUser(user)) return null
  return user
}

export function isOrganizerUser(user: User): boolean {
  if (isAdminUser(user)) return true
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  return meta.role === 'organizer' || meta.role === 'admin'
}
