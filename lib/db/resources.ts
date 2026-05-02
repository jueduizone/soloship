import type { SupabaseClient } from '@supabase/supabase-js'
import type { ResourceRow, ResourceStage, ResourceVisibility } from './types'

export const RESOURCE_STAGE_LABEL: Record<ResourceStage, string> = {
  pre_camp: '开营前',
  week_1: 'Week 1',
  week_2: 'Week 2',
  demo_day: 'Demo Day',
  post_camp: '结营后',
}

export const RESOURCE_STAGE_ORDER: ResourceStage[] = [
  'pre_camp',
  'week_1',
  'week_2',
  'demo_day',
  'post_camp',
]

export interface ResourceInput {
  event_id: string
  title: string
  summary?: string | null
  url?: string | null
  type?: string | null
  stage: ResourceStage
  visibility: ResourceVisibility
  order_index: number
}

export interface ResourceViewer {
  canSeeAdmittedOnly: boolean
}

function orderResourcesQuery(supabase: SupabaseClient, eventId: string) {
  return supabase
    .from('resources')
    .select('*')
    .eq('event_id', eventId)
    .order('stage', { ascending: true })
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })
}

export async function listResourcesForViewer(
  supabase: SupabaseClient,
  eventId: string,
  viewer: ResourceViewer = { canSeeAdmittedOnly: false }
): Promise<ResourceRow[]> {
  const query = viewer.canSeeAdmittedOnly
    ? orderResourcesQuery(supabase, eventId).or('visibility.eq.public,visibility.eq.admitted_only')
    : orderResourcesQuery(supabase, eventId).eq('visibility', 'public')

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ResourceRow[]
}

export async function listVisibleResources(
  supabase: SupabaseClient,
  eventId: string,
  opts: { includeAdmittedOnly?: boolean } = {}
): Promise<ResourceRow[]> {
  return listResourcesForViewer(supabase, eventId, {
    canSeeAdmittedOnly: opts.includeAdmittedOnly ?? false,
  })
}

export function groupResourcesByStage(resources: ResourceRow[]) {
  return RESOURCE_STAGE_ORDER.map(stage => ({
    stage,
    label: RESOURCE_STAGE_LABEL[stage],
    items: resources.filter(r => r.stage === stage),
  })).filter(group => group.items.length > 0)
}

export async function listAdminResources(
  supabase: SupabaseClient,
  eventId: string
): Promise<ResourceRow[]> {
  const { data, error } = await orderResourcesQuery(supabase, eventId)
  if (error) throw error
  return (data ?? []) as ResourceRow[]
}

export async function listResources(
  supabase: SupabaseClient,
  eventId: string
): Promise<ResourceRow[]> {
  return listAdminResources(supabase, eventId)
}

export async function getResourceById(
  supabase: SupabaseClient,
  id: string
): Promise<ResourceRow | null> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as ResourceRow | null
}

export async function createResource(
  supabase: SupabaseClient,
  input: ResourceInput
): Promise<ResourceRow> {
  const { data, error } = await supabase
    .from('resources')
    .insert(input)
    .select('*')
    .single()
  if (error) throw error
  return data as ResourceRow
}

export async function updateResource(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Omit<ResourceInput, 'event_id'>>
): Promise<ResourceRow> {
  const { data, error } = await supabase
    .from('resources')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as ResourceRow
}

export async function deleteResource(
  supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('resources').delete().eq('id', id)
  if (error) throw error
}
