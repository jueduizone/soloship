import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { drawLotteryPrize } from '@/lib/db/lottery'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = createAdminClient()
    const winners = await drawLotteryPrize(admin, params.id, null)
    return NextResponse.json({ ok: true, winners })
  } catch (err) {
    const message = err instanceof Error ? err.message : '抽奖失败'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
