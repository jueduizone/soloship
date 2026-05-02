import type { SupabaseClient } from '@supabase/supabase-js'
import type { FellowProfileRow, RegistrationRow } from './types'

export interface FellowListItem extends FellowProfileRow {
  registration: Pick<RegistrationRow, 'id' | 'status' | 'name' | 'email' | 'user_id'> | null
}

export interface AdminFellowFilters {
  visibility?: FellowProfileRow['visibility']
  published?: boolean
  status?: RegistrationRow['status']
}

/**
 * 列出同学录：只返回对应 registration.status = 'paid' 的 profile。
 * 可见性过滤必须由调用方按当前用户身份处理，避免 service-role 泄露 cohort/private。
 */
export async function listPublicFellows(
  supabase: SupabaseClient,
  eventId: string
): Promise<FellowListItem[]> {
  const { data, error } = await supabase
    .from('fellow_profiles')
    .select(
      '*, registration:registrations!inner(id, status, name, user_id)'
    )
    .eq('event_id', eventId)
    .eq('registrations.status', 'paid')
    .eq('published', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as FellowListItem[]
}

export async function getFellowById(
  supabase: SupabaseClient,
  id: string
): Promise<FellowListItem | null> {
  const { data, error } = await supabase
    .from('fellow_profiles')
    .select(
      '*, registration:registrations!inner(id, status, name, user_id)'
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return (data as unknown as FellowListItem) ?? null
}


export async function listAdminFellows(
  supabase: SupabaseClient,
  eventId: string,
  filters: AdminFellowFilters = {}
): Promise<FellowListItem[]> {
  let q = supabase
    .from('fellow_profiles')
    .select('*, registration:registrations!inner(id, status, name, email, user_id)')
    .eq('event_id', eventId)
    .order('updated_at', { ascending: false })

  if (filters.visibility) q = q.eq('visibility', filters.visibility)
  if (filters.published !== undefined) q = q.eq('published', filters.published)
  if (filters.status) q = q.eq('registrations.status', filters.status)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as unknown as FellowListItem[]
}

export async function updateFellowProfile(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Pick<FellowProfileRow, 'published' | 'visibility' | 'display_name' | 'project_name'>>
): Promise<FellowProfileRow> {
  const { data, error } = await supabase
    .from('fellow_profiles')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as FellowProfileRow
}

export async function getFellowByRegistration(
  supabase: SupabaseClient,
  registrationId: string
): Promise<FellowProfileRow | null> {
  const { data, error } = await supabase
    .from('fellow_profiles')
    .select('*')
    .eq('registration_id', registrationId)
    .maybeSingle()

  if (error) throw error
  return (data as FellowProfileRow | null) ?? null
}

export interface FellowProfilePatch {
  display_name?: string
  avatar_url?: string | null
  one_liner?: string | null
  city?: string | null
  tags?: string[]
  project_name?: string | null
  project_intro?: string | null
  links?: { label: string; url: string }[]
  visibility?: 'public' | 'cohort_only' | 'private'
}

/**
 * 创建或更新某 registration 对应的 fellow_profile。
 * 通常由 /api/profile 走 admin client 调用。
 */
export async function upsertFellowProfile(
  supabase: SupabaseClient,
  registrationId: string,
  eventId: string,
  defaults: { display_name: string },
  patch: FellowProfilePatch = {}
): Promise<FellowProfileRow> {
  const existing = await getFellowByRegistration(supabase, registrationId)

  if (existing) {
    const { data, error } = await supabase
      .from('fellow_profiles')
      .update({
        display_name: patch.display_name ?? existing.display_name,
        avatar_url: patch.avatar_url ?? existing.avatar_url,
        one_liner: patch.one_liner ?? existing.one_liner,
        city: patch.city ?? existing.city,
        tags: patch.tags ?? existing.tags,
        project_name: patch.project_name ?? existing.project_name,
        project_intro: patch.project_intro ?? existing.project_intro,
        links: patch.links ?? existing.links,
        visibility: patch.visibility ?? existing.visibility,
      })
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) throw error
    return data as FellowProfileRow
  }

  const { data, error } = await supabase
    .from('fellow_profiles')
    .insert({
      registration_id: registrationId,
      event_id: eventId,
      display_name: patch.display_name ?? defaults.display_name,
      avatar_url: patch.avatar_url ?? null,
      one_liner: patch.one_liner ?? null,
      city: patch.city ?? null,
      tags: patch.tags ?? [],
      project_name: patch.project_name ?? null,
      project_intro: patch.project_intro ?? null,
      links: patch.links ?? [],
      visibility: patch.visibility ?? 'cohort_only',
      published: true,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as FellowProfileRow
}
