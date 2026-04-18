import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  LinkEntry,
  RegistrationRow,
  RegistrationStatus,
} from './types'

export interface RegistrationInput {
  event_id: string
  user_id: string | null
  name: string
  email: string
  city?: string | null
  bio?: string | null
  build_direction?: string | null
  project_idea?: string | null
  links?: LinkEntry[]
  extra?: Record<string, unknown>
}

/**
 * 创建/更新一条报名。
 * 同一 (event_id, email) 已存在时，若 status 仍在 'submitted' / 'reviewing'
 * 则允许覆盖内容；否则拒绝（录取/已付款后不能再改报名表）。
 * 通常应由 API route 以 service_role 调用。
 */
export async function upsertRegistration(
  supabase: SupabaseClient,
  input: RegistrationInput
): Promise<RegistrationRow> {
  const { data: existing, error: fetchErr } = await supabase
    .from('registrations')
    .select('*')
    .eq('event_id', input.event_id)
    .eq('email', input.email)
    .maybeSingle()

  if (fetchErr) throw fetchErr

  if (existing) {
    const mutable: RegistrationStatus[] = ['submitted', 'reviewing']
    if (!mutable.includes(existing.status as RegistrationStatus)) {
      throw new Error(
        `该邮箱已报名，当前状态为 ${existing.status}，不能重复提交`
      )
    }
    const { data, error } = await supabase
      .from('registrations')
      .update({
        user_id: input.user_id ?? existing.user_id,
        name: input.name,
        city: input.city ?? null,
        bio: input.bio ?? null,
        build_direction: input.build_direction ?? null,
        project_idea: input.project_idea ?? null,
        links: input.links ?? [],
        extra: input.extra ?? {},
      })
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) throw error
    return data as RegistrationRow
  }

  const { data, error } = await supabase
    .from('registrations')
    .insert({
      event_id: input.event_id,
      user_id: input.user_id,
      name: input.name,
      email: input.email,
      city: input.city ?? null,
      bio: input.bio ?? null,
      build_direction: input.build_direction ?? null,
      project_idea: input.project_idea ?? null,
      links: input.links ?? [],
      extra: input.extra ?? {},
    })
    .select('*')
    .single()

  if (error) throw error
  return data as RegistrationRow
}

export async function getRegistrationById(
  supabase: SupabaseClient,
  id: string
): Promise<RegistrationRow | null> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as RegistrationRow | null
}

export async function getRegistrationByUser(
  supabase: SupabaseClient,
  userId: string,
  eventId: string
): Promise<RegistrationRow | null> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle()
  if (error) throw error
  return data as RegistrationRow | null
}

export interface ListRegistrationsOptions {
  eventId?: string
  status?: RegistrationStatus | RegistrationStatus[]
  search?: string
  limit?: number
  offset?: number
}

export async function listRegistrations(
  supabase: SupabaseClient,
  opts: ListRegistrationsOptions = {}
): Promise<{ rows: RegistrationRow[]; total: number }> {
  let q = supabase
    .from('registrations')
    .select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })

  if (opts.eventId) q = q.eq('event_id', opts.eventId)
  if (opts.status) {
    q = Array.isArray(opts.status) ? q.in('status', opts.status) : q.eq('status', opts.status)
  }
  if (opts.search && opts.search.trim()) {
    const term = `%${opts.search.trim()}%`
    q = q.or(`name.ilike.${term},email.ilike.${term},project_idea.ilike.${term}`)
  }
  if (opts.limit != null) q = q.limit(opts.limit)
  if (opts.offset != null) {
    const start = opts.offset
    const end = start + (opts.limit ?? 50) - 1
    q = q.range(start, end)
  }

  const { data, count, error } = await q
  if (error) throw error
  return { rows: (data ?? []) as RegistrationRow[], total: count ?? 0 }
}

export async function updateRegistrationStatus(
  supabase: SupabaseClient,
  registrationId: string,
  status: RegistrationStatus,
  note?: string | null
): Promise<RegistrationRow> {
  const payload: Record<string, unknown> = { status }
  if (note !== undefined) payload.reviewer_note = note
  const { data, error } = await supabase
    .from('registrations')
    .update(payload)
    .eq('id', registrationId)
    .select('*')
    .single()
  if (error) throw error
  return data as RegistrationRow
}
