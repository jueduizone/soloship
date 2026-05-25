'use client'

import Script from 'next/script'
import { useEffect, useMemo, useRef, useState } from 'react'

declare global {
  interface Window {
    TCPlayer?: (
      id: string,
      options: Record<string, unknown>
    ) => {
      dispose?: () => void
    }
  }
}

type PlaybackResponse = {
  ok: true
  playback: {
    appId: number
    fileId: string
    psign: string
    licenseUrl: string | null
    expiresAt: string
  }
  viewer: {
    email: string
  }
}

export function TencentVodPlayer({ resourceId }: { resourceId: string }) {
  const playerId = useMemo(() => `tc-player-${resourceId}`, [resourceId])
  const playerRef = useRef<{ dispose?: () => void } | null>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [playback, setPlayback] = useState<PlaybackResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const href = 'https://web.sdk.qcloud.com/player/tcplayer/release/v5.1.0/tcplayer.min.css'
    if (document.querySelector(`link[href="${href}"]`)) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }, [])

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

  useEffect(() => {
    if (!scriptReady || !playback || !window.TCPlayer) return
    playerRef.current?.dispose?.()

    playerRef.current = window.TCPlayer(playerId, {
      appID: playback.playback.appId,
      fileID: playback.playback.fileId,
      psign: playback.playback.psign,
      licenseUrl: playback.playback.licenseUrl ?? undefined,
      autoplay: false,
      controls: true,
      width: '100%',
      height: '100%',
    })

    return () => {
      playerRef.current?.dispose?.()
      playerRef.current = null
    }
  }, [playerId, playback, scriptReady])

  return (
    <div className="ss-vod-player-shell">
      <Script
        src="https://web.sdk.qcloud.com/player/tcplayer/release/v5.1.0/tcplayer.v5.1.0.min.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setError('腾讯云播放器加载失败，请稍后重试')}
      />

      <div className="ss-vod-player-frame">
        <video
          id={playerId}
          className="tcplayer"
          playsInline
          preload="auto"
        />
        {playback && (
          <div className="ss-vod-watermark" aria-hidden>
            {playback.viewer.email} · {new Date().toLocaleDateString('zh-CN')}
          </div>
        )}
        {(!playback || !scriptReady) && !error && (
          <div className="ss-vod-loading">正在准备安全播放环境…</div>
        )}
        {error && (
          <div className="ss-vod-error">{error}</div>
        )}
      </div>

      <p className="ss-vod-note">
        本课程仅限已付费入营用户观看。页面带有账号水印，请勿录屏、转发或下载。
      </p>
    </div>
  )
}
