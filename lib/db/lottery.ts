import { randomInt } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  LotteryDrawRow,
  LotteryParticipantRow,
  LotteryPrizeRow,
  LotteryWinnerRow,
} from './types'

export interface LotteryPrizeWithWinners extends LotteryPrizeRow {
  winners: LotteryWinnerRow[]
}

export interface LotteryState {
  draw: LotteryDrawRow
  participants: LotteryParticipantRow[]
  prizes: LotteryPrizeWithWinners[]
  winners: LotteryWinnerRow[]
}

export function parseLotteryEmails(input: string): string[] {
  const emailLike = /[^\s,;，；]+@[^\s,;，；]+/g
  const matches = input.match(emailLike) ?? []
  return Array.from(new Set(matches.map(email => email.trim().toLowerCase())))
}

export async function getOrCreateLotteryDraw(
  supabase: SupabaseClient,
  params: { eventId: string; title: string; userId?: string | null }
): Promise<LotteryDrawRow> {
  const { data: existing, error: existingError } = await supabase
    .from('lottery_draws')
    .select('*')
    .eq('event_id', params.eventId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (existingError) throw existingError
  if (existing) return existing as LotteryDrawRow

  const { data, error } = await supabase
    .from('lottery_draws')
    .insert({
      event_id: params.eventId,
      title: params.title,
      created_by: params.userId ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as LotteryDrawRow
}

export async function getLotteryState(
  supabase: SupabaseClient,
  drawId: string
): Promise<LotteryState> {
  const [
    { data: draw, error: drawError },
    { data: participants, error: participantsError },
    { data: prizes, error: prizesError },
    { data: winners, error: winnersError },
  ] = await Promise.all([
    supabase.from('lottery_draws').select('*').eq('id', drawId).single(),
    supabase.from('lottery_participants').select('*').eq('draw_id', drawId).order('email', { ascending: true }),
    supabase.from('lottery_prizes').select('*').eq('draw_id', drawId).order('order_index', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('lottery_winners').select('*').eq('draw_id', drawId).order('drawn_at', { ascending: false }),
  ])
  if (drawError) throw drawError
  if (participantsError) throw participantsError
  if (prizesError) throw prizesError
  if (winnersError) throw winnersError

  const winnerRows = (winners ?? []) as LotteryWinnerRow[]
  const prizeRows = ((prizes ?? []) as LotteryPrizeRow[]).map(prize => ({
    ...prize,
    winners: winnerRows
      .filter(winner => winner.prize_id === prize.id)
      .sort((a, b) => a.position - b.position),
  }))

  return {
    draw: draw as LotteryDrawRow,
    participants: (participants ?? []) as LotteryParticipantRow[],
    prizes: prizeRows,
    winners: winnerRows,
  }
}

export async function replaceLotteryParticipants(
  supabase: SupabaseClient,
  drawId: string,
  emails: string[]
): Promise<number> {
  const uniqueEmails = Array.from(new Set(emails.map(email => email.trim().toLowerCase()).filter(Boolean)))
  const { error: deleteError } = await supabase
    .from('lottery_participants')
    .delete()
    .eq('draw_id', drawId)
  if (deleteError) throw deleteError
  if (uniqueEmails.length === 0) return 0

  const { data, error } = await supabase
    .from('lottery_participants')
    .insert(uniqueEmails.map(email => ({ draw_id: drawId, email })))
    .select('id')
  if (error) throw error
  return data?.length ?? 0
}

export async function createLotteryPrize(
  supabase: SupabaseClient,
  input: { drawId: string; name: string; winnerCount: number; orderIndex: number }
): Promise<LotteryPrizeRow> {
  const { data, error } = await supabase
    .from('lottery_prizes')
    .insert({
      draw_id: input.drawId,
      name: input.name,
      winner_count: input.winnerCount,
      order_index: input.orderIndex,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as LotteryPrizeRow
}

export async function updateLotteryPrize(
  supabase: SupabaseClient,
  id: string,
  patch: { name: string; winnerCount: number; orderIndex: number }
): Promise<LotteryPrizeRow> {
  const { data, error } = await supabase
    .from('lottery_prizes')
    .update({
      name: patch.name,
      winner_count: patch.winnerCount,
      order_index: patch.orderIndex,
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as LotteryPrizeRow
}

export async function drawLotteryPrize(
  supabase: SupabaseClient,
  prizeId: string,
  drawnBy: string | null
): Promise<LotteryWinnerRow[]> {
  const { data: prize, error: prizeError } = await supabase
    .from('lottery_prizes')
    .select('*')
    .eq('id', prizeId)
    .single()
  if (prizeError) throw prizeError
  const prizeRow = prize as LotteryPrizeRow

  const [
    { data: prizeWinners, error: prizeWinnersError },
    { data: drawWinners, error: drawWinnersError },
    { data: participants, error: participantsError },
  ] = await Promise.all([
    supabase.from('lottery_winners').select('*').eq('prize_id', prizeId).order('position', { ascending: true }),
    supabase.from('lottery_winners').select('email').eq('draw_id', prizeRow.draw_id),
    supabase.from('lottery_participants').select('*').eq('draw_id', prizeRow.draw_id),
  ])
  if (prizeWinnersError) throw prizeWinnersError
  if (drawWinnersError) throw drawWinnersError
  if (participantsError) throw participantsError

  const existingPrizeWinners = (prizeWinners ?? []) as LotteryWinnerRow[]
  const remainingSlots = Math.max(0, prizeRow.winner_count - existingPrizeWinners.length)
  if (remainingSlots === 0) return existingPrizeWinners

  const winnerEmails = new Set((drawWinners ?? []).map(row => String(row.email).toLowerCase()))
  const pool = ((participants ?? []) as LotteryParticipantRow[])
    .map(participant => participant.email.toLowerCase())
    .filter(email => !winnerEmails.has(email))

  if (pool.length < remainingSlots) {
    throw new Error(`可抽取邮箱不足，剩余 ${pool.length} 个，当前奖项还需要 ${remainingSlots} 个`)
  }

  const picked = pickRandom(pool, remainingSlots)
  const startPosition = existingPrizeWinners.length + 1
  const { data: inserted, error: insertError } = await supabase
    .from('lottery_winners')
    .insert(picked.map((email, index) => ({
      draw_id: prizeRow.draw_id,
      prize_id: prizeRow.id,
      email,
      position: startPosition + index,
      drawn_by: drawnBy,
    })))
    .select('*')
  if (insertError) throw insertError

  return [...existingPrizeWinners, ...((inserted ?? []) as LotteryWinnerRow[])]
    .sort((a, b) => a.position - b.position)
}

export async function clearLotteryWinners(
  supabase: SupabaseClient,
  drawId: string
): Promise<void> {
  const { error } = await supabase
    .from('lottery_winners')
    .delete()
    .eq('draw_id', drawId)
  if (error) throw error
}

function pickRandom(pool: string[], count: number): string[] {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1)
    const current = copy[i]
    copy[i] = copy[j]
    copy[j] = current
  }
  return copy.slice(0, count)
}
