'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/require-admin'
import { requireOrganizer } from '@/lib/auth/require-organizer'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import {
  BENEFIT_CLAIM_STATUSES,
  BENEFIT_STATUSES,
  BENEFIT_TYPES,
  createBenefit,
  importBenefitCodes,
  updateBenefit,
  updateBenefitClaimStatus,
} from '@/lib/db/benefits'
import { createResource, deleteResource, updateResource } from '@/lib/db/resources'
import { updateFellowProfile } from '@/lib/db/fellows'
import type {
  BenefitClaimStatus,
  BenefitStatus,
  BenefitType,
  EventStatus,
  ProfileVisibility,
  ResourceStage,
  ResourceVisibility,
} from '@/lib/db/types'

const EVENT_STATUSES: EventStatus[] = ['draft', 'recruiting', 'reviewing', 'running', 'finished']
const RESOURCE_STAGES: ResourceStage[] = ['pre_camp', 'week_1', 'week_2', 'week_3', 'demo_day', 'post_camp']
const RESOURCE_VISIBILITIES: ResourceVisibility[] = ['public', 'admitted_only']
const PROFILE_VISIBILITIES: ProfileVisibility[] = ['public', 'cohort_only', 'private']

function getString(formData: FormData, key: string): string | null {
  const value = formData.get(key)
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function mustString(formData: FormData, key: string): string {
  const value = getString(formData, key)
  if (!value) throw new Error(`${key} 不能为空`)
  return value
}

function parseOrderIndex(value: FormDataEntryValue | null): number {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

function parseStage(value: FormDataEntryValue | null): ResourceStage {
  return RESOURCE_STAGES.includes(value as ResourceStage) ? value as ResourceStage : 'pre_camp'
}

function parseResourceVisibility(value: FormDataEntryValue | null): ResourceVisibility {
  return RESOURCE_VISIBILITIES.includes(value as ResourceVisibility) ? value as ResourceVisibility : 'admitted_only'
}

function parseEventStatus(value: FormDataEntryValue | null): EventStatus {
  return EVENT_STATUSES.includes(value as EventStatus) ? value as EventStatus : 'draft'
}

function parseProfileVisibility(value: FormDataEntryValue | null): ProfileVisibility {
  return PROFILE_VISIBILITIES.includes(value as ProfileVisibility) ? value as ProfileVisibility : 'cohort_only'
}

function parseBenefitType(value: FormDataEntryValue | null): BenefitType {
  return BENEFIT_TYPES.includes(value as BenefitType) ? value as BenefitType : 'link'
}

function parseBenefitStatus(value: FormDataEntryValue | null): BenefitStatus {
  return BENEFIT_STATUSES.includes(value as BenefitStatus) ? value as BenefitStatus : 'active'
}

function parseBenefitClaimStatus(value: FormDataEntryValue | null): BenefitClaimStatus {
  return BENEFIT_CLAIM_STATUSES.includes(value as BenefitClaimStatus) ? value as BenefitClaimStatus : 'pending_fulfillment'
}

function parseOptionalInteger(value: FormDataEntryValue | null): number | null {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : null
}

export async function createResourceAction(formData: FormData) {
  await requireOrganizer()
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  await createResource(admin, {
    event_id: event.id,
    title: mustString(formData, 'title'),
    summary: getString(formData, 'summary'),
    url: getString(formData, 'url'),
    type: getString(formData, 'type') ?? 'link',
    stage: parseStage(formData.get('stage')),
    visibility: parseResourceVisibility(formData.get('visibility')),
    order_index: parseOrderIndex(formData.get('order_index')),
  })
  revalidatePath('/admin/resources')
  revalidatePath('/resources')
  redirect('/admin/resources')
}

export async function updateResourceAction(formData: FormData) {
  await requireOrganizer()
  const id = mustString(formData, 'id')
  const admin = createAdminClient()
  await updateResource(admin, id, {
    title: mustString(formData, 'title'),
    summary: getString(formData, 'summary'),
    url: getString(formData, 'url'),
    type: getString(formData, 'type') ?? 'link',
    stage: parseStage(formData.get('stage')),
    visibility: parseResourceVisibility(formData.get('visibility')),
    order_index: parseOrderIndex(formData.get('order_index')),
  })
  revalidatePath('/admin/resources')
  revalidatePath('/resources')
  redirect('/admin/resources')
}

export async function deleteResourceAction(formData: FormData) {
  await requireOrganizer()
  const id = mustString(formData, 'id')
  const admin = createAdminClient()
  await deleteResource(admin, id)
  revalidatePath('/admin/resources')
  revalidatePath('/resources')
}

export async function createBenefitAction(formData: FormData) {
  await requireAdmin()
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const benefit = await createBenefit(admin, {
    event_id: event.id,
    title: mustString(formData, 'title'),
    provider: getString(formData, 'provider'),
    type: parseBenefitType(formData.get('type')),
    status: parseBenefitStatus(formData.get('status')),
    description: getString(formData, 'description'),
    claim_instructions: getString(formData, 'claim_instructions'),
    redeem_url: getString(formData, 'redeem_url'),
    total_stock: parseOptionalInteger(formData.get('total_stock')),
    per_user_limit: parseOptionalInteger(formData.get('per_user_limit')) ?? 1,
    starts_at: getString(formData, 'starts_at'),
    ends_at: getString(formData, 'ends_at'),
    order_index: parseOrderIndex(formData.get('order_index')),
  })
  const codeText = getString(formData, 'codes')
  if (codeText) {
    await importBenefitCodes(admin, benefit.id, codeText.split(/\r?\n|,/))
  }
  revalidatePath('/admin/benefits')
  revalidatePath('/benefits')
  redirect('/admin/benefits')
}

export async function updateBenefitAction(formData: FormData) {
  await requireAdmin()
  const id = mustString(formData, 'id')
  const admin = createAdminClient()
  await updateBenefit(admin, id, {
    title: mustString(formData, 'title'),
    provider: getString(formData, 'provider'),
    type: parseBenefitType(formData.get('type')),
    status: parseBenefitStatus(formData.get('status')),
    description: getString(formData, 'description'),
    claim_instructions: getString(formData, 'claim_instructions'),
    redeem_url: getString(formData, 'redeem_url'),
    total_stock: parseOptionalInteger(formData.get('total_stock')),
    per_user_limit: parseOptionalInteger(formData.get('per_user_limit')) ?? 1,
    starts_at: getString(formData, 'starts_at'),
    ends_at: getString(formData, 'ends_at'),
    order_index: parseOrderIndex(formData.get('order_index')),
  })
  const codeText = getString(formData, 'codes')
  if (codeText) {
    await importBenefitCodes(admin, id, codeText.split(/\r?\n|,/))
  }
  revalidatePath('/admin/benefits')
  revalidatePath('/benefits')
  redirect('/admin/benefits')
}

export async function updateBenefitClaimAction(formData: FormData) {
  await requireAdmin()
  const id = mustString(formData, 'id')
  const admin = createAdminClient()
  await updateBenefitClaimStatus(
    admin,
    id,
    parseBenefitClaimStatus(formData.get('status')),
    getString(formData, 'tracking_info')
  )
  revalidatePath('/admin/benefits')
  revalidatePath('/benefits')
}

export async function updateFellowAction(formData: FormData) {
  await requireOrganizer()
  const id = mustString(formData, 'id')
  const admin = createAdminClient()
  await updateFellowProfile(admin, id, {
    published: formData.get('published') === 'true',
    visibility: parseProfileVisibility(formData.get('visibility')),
  })
  revalidatePath('/admin/fellows')
  revalidatePath('/fellows')
}

export async function updateEventAction(formData: FormData) {
  await requireOrganizer()
  const id = mustString(formData, 'id')
  const admin = createAdminClient()
  const price = Math.max(0, Math.round(Number(formData.get('price_yuan') ?? 0) * 100))
  const capacityRaw = getString(formData, 'capacity')
  const capacity = capacityRaw == null ? null : Math.max(0, Math.trunc(Number(capacityRaw) || 0))

  const { error } = await admin
    .from('events')
    .update({
      status: parseEventStatus(formData.get('status')),
      capacity,
      price_cents: price,
      start_date: getString(formData, 'start_date'),
      end_date: getString(formData, 'end_date'),
      demo_day_date: getString(formData, 'demo_day_date'),
    })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/admin/events')
  revalidatePath('/')
}
