import { NextResponse, type NextRequest } from 'next/server'
import { getAdminUser } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordAdmissionDecision } from '@/lib/db/admission'
import type { AdmissionDecisionKind } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

const ALLOWED: AdmissionDecisionKind[] = ['admit', 'waitlist', 'reject']

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 })

  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: '无效请求体' }, { status: 400 }) }

  const decision = body.decision as AdmissionDecisionKind | undefined
  if (!decision || !ALLOWED.includes(decision)) {
    return NextResponse.json({ error: '无效 decision' }, { status: 400 })
  }
  const note = typeof body.note === 'string' ? body.note : null

  const client = createAdminClient()
  try {
    const row = await recordAdmissionDecision(client, {
      registrationId: params.id,
      reviewerId: admin.id,
      decision,
      note,
    })
    return NextResponse.json({ ok: true, decision: row })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
