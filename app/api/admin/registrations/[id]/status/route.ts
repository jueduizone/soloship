import { NextResponse, type NextRequest } from 'next/server'
import { getAdminUser } from '@/lib/auth/require-admin'
import { ADMIN_REGISTRATION_STATUS_LABEL, isAdminStatusOverride } from '@/lib/admin/registration-status'
import { updateRegistrationStatus } from '@/lib/db/registrations'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 })

  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: '无效请求体' }, { status: 400 }) }

  if (!isAdminStatusOverride(body.status)) {
    return NextResponse.json({ error: '无效状态' }, { status: 400 })
  }

  const noteInput = typeof body.note === 'string' ? body.note.trim() : ''
  const note = noteInput || `管理员手动修正状态为「${ADMIN_REGISTRATION_STATUS_LABEL[body.status]}」`

  try {
    const registration = await updateRegistrationStatus(
      createAdminClient(),
      params.id,
      body.status,
      note
    )

    return NextResponse.json({ ok: true, registration, status: registration.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
