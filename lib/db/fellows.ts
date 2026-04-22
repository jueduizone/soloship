import type { SupabaseClient } from '@supabase/supabase-js'
import type { FellowProfileRow, RegistrationRow } from './types'

export interface FellowListItem extends FellowProfileRow {
  registration: Pick<RegistrationRow, 'id' | 'status' | 'name'> | null
}

/**
 * 列出同学录：只显示对应 registration.status = 'paid' 的 profile。
 * public read 场景（不鉴权）。
 */
export async function listPublicFellows(
  supabase: SupabaseClient,
  eventId: string
): Promise<FellowListItem[]> {
  const { data, error } = await supabase
    .from('fellow_profiles')
    .select(
      '*, registration:registrations!inner(id, status, name)'
    )
    .eq('event_id', eventId)
    .eq('registrations.status', 'paid')
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
      '*, registration:registrations!inner(id, status, name)'
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return (data as unknown as FellowListItem) ?? null
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
