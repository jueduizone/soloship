import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { drawLotteryAllPrizes, getOrCreateLotteryDraw } from '@/lib/db/lottery'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const admin = createAdminClient()
    const event = await getDefaultEvent(admin)
    const draw = await getOrCreateLotteryDraw(admin, {
      eventId: event.id,
      title: `${event.name} 抽奖`,
      userId: null,
    })
    const winners = await drawLotteryAllPrizes(admin, draw.id, null)
    return NextResponse.json({ ok: true, winners })
  } catch (err) {
    const message = err instanceof Error ? err.message : '抽奖失败'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
