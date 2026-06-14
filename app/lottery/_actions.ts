'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import {
  clearLotteryWinners,
  createLotteryPrize,
  createNextLotteryRound,
  deleteLotteryPrize,
  getOrCreateLotteryDraw,
  parseLotteryEmails,
  replaceLotteryParticipants,
  updateLotteryPrize,
} from '@/lib/db/lottery'

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

function parsePositiveInteger(value: FormDataEntryValue | null, fallback: number): number {
  const raw = typeof value === 'string' ? value.trim() : ''
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.trunc(parsed)
}

async function getPublicLotteryDraw() {
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const draw = await getOrCreateLotteryDraw(admin, {
    eventId: event.id,
    title: `${event.name} 抽奖`,
    userId: null,
  })
  return { admin, draw }
}

export async function importLotteryParticipantsAction(formData: FormData) {
  const { admin, draw } = await getPublicLotteryDraw()
  const emails = parseLotteryEmails(mustString(formData, 'emails'))
  if (emails.length === 0) throw new Error('请至少导入一个邮箱')
  await replaceLotteryParticipants(admin, draw.id, emails)
  revalidatePath('/lottery')
}

export async function clearLotteryParticipantsAction() {
  const { admin, draw } = await getPublicLotteryDraw()
  await replaceLotteryParticipants(admin, draw.id, [])
  revalidatePath('/lottery')
}

export async function createLotteryPrizeAction(formData: FormData) {
  const { admin, draw } = await getPublicLotteryDraw()
  await createLotteryPrize(admin, {
    drawId: draw.id,
    name: mustString(formData, 'name'),
    winnerCount: parsePositiveInteger(formData.get('winner_count'), 1),
    orderIndex: parseOrderIndex(formData.get('order_index')),
  })
  revalidatePath('/lottery')
}

export async function updateLotteryPrizeAction(formData: FormData) {
  const admin = createAdminClient()
  await updateLotteryPrize(admin, mustString(formData, 'id'), {
    name: mustString(formData, 'name'),
    winnerCount: parsePositiveInteger(formData.get('winner_count'), 1),
    orderIndex: parseOrderIndex(formData.get('order_index')),
  })
  revalidatePath('/lottery')
}

export async function deleteLotteryPrizeAction(formData: FormData) {
  const admin = createAdminClient()
  await deleteLotteryPrize(admin, mustString(formData, 'id'))
  revalidatePath('/lottery')
}

export async function clearLotteryHistoryAction() {
  const { admin, draw } = await getPublicLotteryDraw()
  await clearLotteryWinners(admin, draw.id)
  revalidatePath('/lottery')
}

export async function startNextLotteryRoundAction() {
  const { admin, draw } = await getPublicLotteryDraw()
  await createNextLotteryRound(admin, draw.id)
  revalidatePath('/lottery')
}
