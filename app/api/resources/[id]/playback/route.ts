import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isOrganizerUser } from '@/lib/auth/require-organizer'
import { getResourceById } from '@/lib/db/resources'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import { createTencentVodPlayback, parseTencentVodFileId } from '@/lib/vod/tencent'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const admin = createAdminClient()

  try {
    const resource = await getResourceById(admin, params.id)
    if (!resource) {
      return NextResponse.json({ error: '资料不存在' }, { status: 404 })
    }

    const registration = user.email
      ? await getRegistrationForApplicant(admin, {
          userId: user.id,
          email: user.email,
          eventId: resource.event_id,
        })
      : null
    const canPlay = registration?.status === 'paid' || isOrganizerUser(user)

    if (!canPlay) {
      return NextResponse.json({ error: '仅已付费入营用户可以观看课程视频' }, { status: 403 })
    }

    if (resource.type !== 'video') {
      return NextResponse.json({ error: '该资料不是视频' }, { status: 400 })
    }

    const fileId = parseTencentVodFileId(resource.url)
    if (!fileId) {
      return NextResponse.json({ error: '视频尚未配置腾讯云 VOD fileId' }, { status: 400 })
    }

    const playback = createTencentVodPlayback(fileId)
    return NextResponse.json({
      ok: true,
      playback,
      viewer: {
        email: user.email ?? registration?.email ?? 'unknown',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
