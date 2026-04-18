import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

/**
 * Gate a server component / route handler to admin users only.
 * Admin = auth.users.raw_user_meta_data.is_admin === true.
 *
 * 非 admin 登录用户 → 踢去 /。未登录 → 踢去 /auth/login。
 * Route handlers 想返回 401/403 的话，请用 getAdminUser 自行判断。
 */
export async function requireAdmin(): Promise<User> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin/registrations')
  if (!isAdminUser(user)) redirect('/')
  return user
}

export async function getAdminUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if (!isAdminUser(user)) return null
  return user
}

export function isAdminUser(user: User): boolean {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  return meta.is_admin === true
}
