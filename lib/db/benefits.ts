import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BenefitClaimRow,
  BenefitClaimStatus,
  BenefitCodeRow,
  BenefitRow,
  BenefitStatus,
  BenefitType,
  RegistrationRow,
} from './types'

export const BENEFIT_TYPES: BenefitType[] = ['token_code', 'link', 'merch', 'manual']
export const BENEFIT_STATUSES: BenefitStatus[] = ['active', 'paused', 'archived']
export const BENEFIT_CLAIM_STATUSES: BenefitClaimStatus[] = [
  'claimed',
  'pending_fulfillment',
  'fulfilled',
  'cancelled',
]

export const BENEFIT_TYPE_LABEL: Record<BenefitType, string> = {
  token_code: 'Token / 兑换码',
  link: '领取链接',
  merch: '周边邮寄',
  manual: '人工发放',
}

export const BENEFIT_STATUS_LABEL: Record<BenefitStatus, string> = {
  active: '可领取',
  paused: '暂停',
  archived: '归档',
}

export const BENEFIT_CLAIM_STATUS_LABEL: Record<BenefitClaimStatus, string> = {
  claimed: '已领取',
  pending_fulfillment: '待发放',
  fulfilled: '已发放',
  cancelled: '已取消',
}

export interface BenefitInput {
  event_id: string
  title: string
  provider?: string | null
  type: BenefitType
  status: BenefitStatus
  description?: string | null
  claim_instructions?: string | null
  redeem_url?: string | null
  total_stock?: number | null
  per_user_limit?: number
  starts_at?: string | null
  ends_at?: string | null
  order_index: number
}

export interface BenefitWithStats extends BenefitRow {
  code_count: number
  assigned_code_count: number
  claim_count: number
}

export interface BenefitClaimWithBenefit extends BenefitClaimRow {
  benefit?: Pick<BenefitRow, 'id' | 'title' | 'provider' | 'type'> | null
}

export interface ViewerBenefit extends BenefitRow {
  claim: BenefitClaimRow | null
  assigned_code: string | null
  claimed_count: number
  available_code_count: number | null
}

function orderBenefitsQuery(supabase: SupabaseClient, eventId: string) {
  return supabase
    .from('benefits')
    .select('*')
    .eq('event_id', eventId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
}

function isWithinClaimWindow(benefit: BenefitRow, now = new Date()) {
  if (benefit.starts_at && new Date(benefit.starts_at) > now) return false
  if (benefit.ends_at && new Date(benefit.ends_at) < now) return false
  return true
}

export function canClaimBenefit(benefit: BenefitRow) {
  return benefit.status === 'active' && isWithinClaimWindow(benefit)
}

export async function listAdminBenefits(
  supabase: SupabaseClient,
  eventId: string
): Promise<BenefitWithStats[]> {
  const { data, error } = await orderBenefitsQuery(supabase, eventId)
  if (error) throw error
  const benefits = (data ?? []) as BenefitRow[]
  if (benefits.length === 0) return []

  const ids = benefits.map(benefit => benefit.id)
  const [{ data: codes, error: codesError }, { data: claims, error: claimsError }] = await Promise.all([
    supabase.from('benefit_codes').select('benefit_id,assigned_at').in('benefit_id', ids),
    supabase.from('benefit_claims').select('benefit_id,status').in('benefit_id', ids),
  ])
  if (codesError) throw codesError
  if (claimsError) throw claimsError

  return benefits.map(benefit => {
    const benefitCodes = (codes ?? []).filter(code => code.benefit_id === benefit.id)
    const benefitClaims = (claims ?? []).filter(claim => claim.benefit_id === benefit.id)
    return {
      ...benefit,
      code_count: benefitCodes.length,
      assigned_code_count: benefitCodes.filter(code => code.assigned_at).length,
      claim_count: benefitClaims.filter(claim => claim.status !== 'cancelled').length,
    }
  })
}

export async function listBenefitsForViewer(
  supabase: SupabaseClient,
  eventId: string,
  viewer: { userId: string; canSeeBenefits: boolean }
): Promise<ViewerBenefit[]> {
  if (!viewer.canSeeBenefits) return []

  const nowIso = new Date().toISOString()
  const { data, error } = await orderBenefitsQuery(supabase, eventId)
    .eq('status', 'active')
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
  if (error) throw error
  const benefits = (data ?? []) as BenefitRow[]
  if (benefits.length === 0) return []

  const ids = benefits.map(benefit => benefit.id)
  const [{ data: claims, error: claimsError }, { data: codes, error: codesError }] = await Promise.all([
    supabase
      .from('benefit_claims')
      .select('*')
      .in('benefit_id', ids)
      .eq('user_id', viewer.userId)
      .neq('status', 'cancelled'),
    supabase
      .from('benefit_codes')
      .select('*')
      .in('benefit_id', ids)
      .or(`assigned_to_user_id.eq.${viewer.userId},assigned_at.is.null`),
  ])
  if (claimsError) throw claimsError
  if (codesError) throw codesError

  const claimRows = (claims ?? []) as BenefitClaimRow[]
  const codeRows = (codes ?? []) as BenefitCodeRow[]

  return benefits.map(benefit => {
    const claim = claimRows.find(row => row.benefit_id === benefit.id) ?? null
    const assignedCode = claim
      ? codeRows.find(code => code.benefit_id === benefit.id && code.assigned_claim_id === claim.id)
      : null
    return {
      ...benefit,
      claim,
      assigned_code: assignedCode?.code ?? null,
      claimed_count: claimRows.filter(row => row.benefit_id === benefit.id).length,
      available_code_count: benefit.type === 'token_code'
        ? codeRows.filter(code => code.benefit_id === benefit.id && !code.assigned_at).length
        : null,
    }
  })
}

export async function getBenefitById(
  supabase: SupabaseClient,
  id: string
): Promise<BenefitRow | null> {
  const { data, error } = await supabase
    .from('benefits')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as BenefitRow | null
}

export async function createBenefit(
  supabase: SupabaseClient,
  input: BenefitInput
): Promise<BenefitRow> {
  const { data, error } = await supabase
    .from('benefits')
    .insert({
      ...input,
      per_user_limit: input.per_user_limit ?? 1,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as BenefitRow
}

export async function updateBenefit(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Omit<BenefitInput, 'event_id'>>
): Promise<BenefitRow> {
  const { data, error } = await supabase
    .from('benefits')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as BenefitRow
}

export async function importBenefitCodes(
  supabase: SupabaseClient,
  benefitId: string,
  codes: string[]
): Promise<number> {
  const uniqueCodes = Array.from(new Set(codes.map(code => code.trim()).filter(Boolean)))
  if (uniqueCodes.length === 0) return 0
  const { data, error } = await supabase
    .from('benefit_codes')
    .upsert(
      uniqueCodes.map(code => ({ benefit_id: benefitId, code })),
      { onConflict: 'benefit_id,code', ignoreDuplicates: true }
    )
    .select('id')
  if (error) throw error
  return data?.length ?? 0
}

export async function listBenefitClaims(
  supabase: SupabaseClient,
  eventId: string
): Promise<BenefitClaimWithBenefit[]> {
  const { data: benefits, error: benefitError } = await supabase
    .from('benefits')
    .select('id,title,provider,type')
    .eq('event_id', eventId)
  if (benefitError) throw benefitError
  const benefitRows = (benefits ?? []) as Pick<BenefitRow, 'id' | 'title' | 'provider' | 'type'>[]
  if (benefitRows.length === 0) return []

  const { data, error } = await supabase
    .from('benefit_claims')
    .select('*')
    .in('benefit_id', benefitRows.map(benefit => benefit.id))
    .order('created_at', { ascending: false })
  if (error) throw error

  return ((data ?? []) as BenefitClaimRow[]).map(claim => ({
    ...claim,
    benefit: benefitRows.find(benefit => benefit.id === claim.benefit_id) ?? null,
  }))
}

export async function claimBenefit(
  supabase: SupabaseClient,
  params: {
    benefitId: string
    userId: string
    registration: RegistrationRow
    payload?: Record<string, unknown>
  }
): Promise<{ claim: BenefitClaimRow; code: string | null }> {
  if (params.registration.status !== 'paid') {
    throw new Error('仅已付费入营用户可以领取福利')
  }

  const benefit = await getBenefitById(supabase, params.benefitId)
  if (!benefit) throw new Error('福利不存在')
  if (!canClaimBenefit(benefit)) throw new Error('该福利当前不可领取')
  if (benefit.event_id !== params.registration.event_id) {
    throw new Error('福利与报名活动不匹配')
  }

  const { data: existing, error: existingError } = await supabase
    .from('benefit_claims')
    .select('*')
    .eq('benefit_id', benefit.id)
    .eq('user_id', params.userId)
    .neq('status', 'cancelled')
    .maybeSingle()
  if (existingError) throw existingError
  if (existing) {
    const code = await getAssignedCodeForClaim(supabase, existing.id)
    return { claim: existing as BenefitClaimRow, code }
  }

  if (benefit.total_stock != null) {
    const { count, error: countError } = await supabase
      .from('benefit_claims')
      .select('id', { count: 'exact', head: true })
      .eq('benefit_id', benefit.id)
      .neq('status', 'cancelled')
    if (countError) throw countError
    if ((count ?? 0) >= benefit.total_stock) {
      throw new Error('该福利已领完')
    }
  }

  const status: BenefitClaimStatus = benefit.type === 'merch' || benefit.type === 'manual'
    ? 'pending_fulfillment'
    : 'claimed'
  const payload = params.payload ?? {}

  if (benefit.type === 'token_code') {
    const { data: nextCode, error: codeError } = await supabase
      .from('benefit_codes')
      .select('*')
      .eq('benefit_id', benefit.id)
      .is('assigned_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (codeError) throw codeError
    if (!nextCode) throw new Error('该福利兑换码已领完')

    const claim = await insertBenefitClaim(supabase, benefit.id, params, status, payload)
    const { data: updatedCode, error: updateCodeError } = await supabase
      .from('benefit_codes')
      .update({
        assigned_to_user_id: params.userId,
        assigned_claim_id: claim.id,
        assigned_at: new Date().toISOString(),
      })
      .eq('id', (nextCode as BenefitCodeRow).id)
      .is('assigned_at', null)
      .select('*')
      .single()
    if (updateCodeError) {
      await supabase.from('benefit_claims').delete().eq('id', claim.id)
      throw updateCodeError
    }
    return { claim, code: (updatedCode as BenefitCodeRow).code }
  }

  const claim = await insertBenefitClaim(supabase, benefit.id, params, status, payload)
  return { claim, code: null }
}

async function insertBenefitClaim(
  supabase: SupabaseClient,
  benefitId: string,
  params: {
    userId: string
    registration: RegistrationRow
  },
  status: BenefitClaimStatus,
  payload: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('benefit_claims')
    .insert({
      benefit_id: benefitId,
      user_id: params.userId,
      registration_id: params.registration.id,
      user_email: params.registration.email,
      user_name: params.registration.name,
      status,
      claim_payload: payload,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as BenefitClaimRow
}

export async function getAssignedCodeForClaim(
  supabase: SupabaseClient,
  claimId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('benefit_codes')
    .select('code')
    .eq('assigned_claim_id', claimId)
    .maybeSingle()
  if (error) throw error
  return (data as Pick<BenefitCodeRow, 'code'> | null)?.code ?? null
}

export async function updateBenefitClaimStatus(
  supabase: SupabaseClient,
  claimId: string,
  status: BenefitClaimStatus,
  trackingInfo?: string | null
): Promise<BenefitClaimRow> {
  const patch: Record<string, unknown> = { status }
  if (trackingInfo !== undefined) patch.tracking_info = trackingInfo
  patch.fulfilled_at = status === 'fulfilled' ? new Date().toISOString() : null

  const { data, error } = await supabase
    .from('benefit_claims')
    .update(patch)
    .eq('id', claimId)
    .select('*')
    .single()
  if (error) throw error
  return data as BenefitClaimRow
}
