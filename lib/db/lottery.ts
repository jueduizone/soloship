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
  draws: LotteryDrawRow[]
  participants: LotteryParticipantRow[]
  prizes: LotteryPrizeWithWinners[]
  allPrizes: LotteryPrizeRow[]
  winners: LotteryWinnerRow[]
  allWinners: LotteryWinnerRow[]
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
    .order('created_at', { ascending: false })
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
  const { data: draw, error: drawError } = await supabase
    .from('lottery_draws')
    .select('*')
    .eq('id', drawId)
    .single()
  if (drawError) throw drawError
  const drawRow = draw as LotteryDrawRow

  const { data: draws, error: drawsError } = await supabase
    .from('lottery_draws')
    .select('*')
    .eq('event_id', drawRow.event_id)
    .order('created_at', { ascending: true })
  if (drawsError) throw drawsError
  const drawRows = (draws ?? []) as LotteryDrawRow[]
  const drawIds = drawRows.map(item => item.id)

  const [
    { data: participants, error: participantsError },
    { data: prizes, error: prizesError },
    { data: allPrizes, error: allPrizesError },
    { data: allWinners, error: allWinnersError },
  ] = await Promise.all([
    supabase.from('lottery_participants').select('*').eq('draw_id', drawId).order('email', { ascending: true }),
    supabase.from('lottery_prizes').select('*').eq('draw_id', drawId).order('order_index', { ascending: true }).order('created_at', { ascending: true }),
    drawIds.length > 0
      ? supabase.from('lottery_prizes').select('*').in('draw_id', drawIds)
      : Promise.resolve({ data: [], error: null }),
    drawIds.length > 0
      ? supabase.from('lottery_winners').select('*').in('draw_id', drawIds).order('drawn_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ])
  if (participantsError) throw participantsError
  if (prizesError) throw prizesError
  if (allPrizesError) throw allPrizesError
  if (allWinnersError) throw allWinnersError

  const allWinnerRows = (allWinners ?? []) as LotteryWinnerRow[]
  const currentWinnerRows = allWinnerRows.filter(winner => winner.draw_id === drawId)
  const prizeRows = ((prizes ?? []) as LotteryPrizeRow[]).map(prize => ({
    ...prize,
    winners: currentWinnerRows
      .filter(winner => winner.prize_id === prize.id)
      .sort((a, b) => a.position - b.position),
  }))

  return {
    draw: drawRow,
    draws: drawRows,
    participants: (participants ?? []) as LotteryParticipantRow[],
    prizes: prizeRows,
    allPrizes: (allPrizes ?? []) as LotteryPrizeRow[],
    winners: currentWinnerRows,
    allWinners: allWinnerRows,
  }
}

export async function createNextLotteryRound(
  supabase: SupabaseClient,
  drawId: string
): Promise<LotteryDrawRow> {
  const state = await getLotteryState(supabase, drawId)
  const nextRound = state.draws.length + 1
  const { data: draw, error: drawError } = await supabase
    .from('lottery_draws')
    .insert({
      event_id: state.draw.event_id,
      title: `${state.draw.title.replace(/\s·\s第\s\d+\s轮$/, '')} · 第 ${nextRound} 轮`,
      created_by: state.draw.created_by,
    })
    .select('*')
    .single()
  if (drawError) throw drawError
  const nextDraw = draw as LotteryDrawRow

  if (state.participants.length > 0) {
    const { error } = await supabase
      .from('lottery_participants')
      .insert(state.participants.map(participant => ({
        draw_id: nextDraw.id,
        email: participant.email,
      })))
    if (error) throw error
  }

  if (state.prizes.length > 0) {
    const { error } = await supabase
      .from('lottery_prizes')
      .insert(state.prizes.map(prize => ({
        draw_id: nextDraw.id,
        name: prize.name,
        winner_count: prize.winner_count,
        order_index: prize.order_index,
      })))
    if (error) throw error
  }

  return nextDraw
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

export async function deleteLotteryPrize(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('lottery_prizes')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function drawLotteryAllPrizes(
  supabase: SupabaseClient,
  drawId: string,
  drawnBy: string | null
): Promise<LotteryWinnerRow[]> {
  const state = await getLotteryState(supabase, drawId)
  if (state.participants.length === 0) {
    throw new Error('请先导入邮箱后再抽奖')
  }
  if (state.prizes.length === 0) {
    throw new Error('请先设置奖项后再抽奖')
  }

  const duplicateNames = findDuplicatePrizeNames(state.prizes)
  if (duplicateNames.length > 0) {
    throw new Error(`存在重复奖项：${duplicateNames.join('、')}，请先调整奖项名称`)
  }

  const remainingByPrize = state.prizes.map(prize => ({
    prize,
    remainingSlots: Math.max(0, prize.winner_count - prize.winners.length),
  }))
  const totalRemaining = remainingByPrize.reduce((total, item) => total + item.remainingSlots, 0)
  if (totalRemaining === 0) {
    return state.winners
  }

  const winnerEmails = new Set(state.allWinners.map(winner => winner.email.toLowerCase()))
  const pool = state.participants
    .map(participant => participant.email.toLowerCase())
    .filter(email => !winnerEmails.has(email))
  if (pool.length < totalRemaining) {
    throw new Error(`剩余可抽邮箱不足：还需要 ${totalRemaining} 个名额，当前仅剩 ${pool.length} 个邮箱`)
  }

  const shuffled = pickRandom(pool, pool.length)
  let cursor = 0
  const inserts: Array<{
    draw_id: string
    prize_id: string
    email: string
    position: number
    drawn_by: string | null
  }> = []

  for (const item of remainingByPrize) {
    if (item.remainingSlots === 0) continue
    const startPosition = item.prize.winners.length + 1
    const emails = shuffled.slice(cursor, cursor + item.remainingSlots)
    cursor += item.remainingSlots
    inserts.push(...emails.map((email, index) => ({
      draw_id: drawId,
      prize_id: item.prize.id,
      email,
      position: startPosition + index,
      drawn_by: drawnBy,
    })))
  }

  const { data, error } = await supabase
    .from('lottery_winners')
    .insert(inserts)
    .select('*')
  if (error) throw error

  return [...state.winners, ...((data ?? []) as LotteryWinnerRow[])]
    .sort((a, b) => new Date(b.drawn_at).getTime() - new Date(a.drawn_at).getTime())
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

export async function clearLotteryWinnersForEvent(
  supabase: SupabaseClient,
  eventId: string
): Promise<void> {
  const { data: draws, error: drawsError } = await supabase
    .from('lottery_draws')
    .select('id')
    .eq('event_id', eventId)
  if (drawsError) throw drawsError

  const drawIds = (draws ?? []).map(draw => String(draw.id))
  if (drawIds.length === 0) return

  const { error } = await supabase
    .from('lottery_winners')
    .delete()
    .in('draw_id', drawIds)
  if (error) throw error
}

function findDuplicatePrizeNames(prizes: LotteryPrizeRow[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const prize of prizes) {
    const normalized = prize.name.trim().toLowerCase()
    if (!normalized) continue
    if (seen.has(normalized)) duplicates.add(prize.name.trim())
    seen.add(normalized)
  }
  return Array.from(duplicates)
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
