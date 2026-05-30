'use client'

import { useEffect, useState } from 'react'

type PlaybackResponse = {
  ok: true
  playback: {
    iframeUrl: string
    expiresAt: string
  }
  viewer: {
    email: string
  }
}

export function CloudflareStreamPlayer({
  resourceId,
  loadingLabel = '正在准备安全播放环境…',
  securityNote = '本课程仅限已付费入营用户观看。页面带有账号水印，请勿录屏、转发或下载。',
}: {
  resourceId: string
  loadingLabel?: string
  securityNote?: string
}) {
  const [playback, setPlayback] = useState<PlaybackResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPlayback() {
      setError(null)
      const res = await fetch(`/api/resources/${resourceId}/playback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json().catch(() => ({}))

      if (cancelled) return
      if (!res.ok) {
        setError(data?.error ?? '无法加载视频播放凭证')
        return
      }
      setPlayback(data as PlaybackResponse)
    }

    loadPlayback()

    return () => {
      cancelled = true
    }
  }, [resourceId])

  return (
    <div className="ss-vod-player-shell">
      <div className="ss-vod-player-frame">
        {playback && (
          <iframe
            src={playback.playback.iframeUrl}
            title="SoloShip course video"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        {playback && (
          <div className="ss-vod-watermark" aria-hidden>
            {playback.viewer.email} · {new Date().toLocaleDateString('zh-CN')}
          </div>
        )}
        {!playback && !error && (
          <div className="ss-vod-loading">{loadingLabel}</div>
        )}
        {error && (
          <div className="ss-vod-error">{error}</div>
        )}
      </div>

      <p className="ss-vod-note">
        {securityNote}
      </p>
    </div>
  )
}
