import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { drawLotteryPrize } from '@/lib/db/lottery'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAdminUser()
  if (!user) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  try {
    const admin = createAdminClient()
    const winners = await drawLotteryPrize(admin, params.id, user.id)
    return NextResponse.json({ ok: true, winners })
  } catch (err) {
    const message = err instanceof Error ? err.message : '抽奖失败'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
