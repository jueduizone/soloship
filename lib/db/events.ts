import type { SupabaseClient } from '@supabase/supabase-js'
import type { EventRow } from './types'

export const DEFAULT_EVENT_SLUG = 'vol-1'

export async function getEventBySlug(
  supabase: SupabaseClient,
  slug: string = DEFAULT_EVENT_SLUG
): Promise<EventRow | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data as EventRow | null
}

export async function getDefaultEvent(supabase: SupabaseClient): Promise<EventRow> {
  const event = await getEventBySlug(supabase, DEFAULT_EVENT_SLUG)
  if (!event) {
    throw new Error(
      `默认活动未找到。请确认在 Supabase 中跑过 lib/db/schema.sql（seed 会插入 slug='${DEFAULT_EVENT_SLUG}'）`
    )
  }
  return event
}
