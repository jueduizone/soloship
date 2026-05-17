'use client'

import { useEffect, useState } from 'react'

function isWeChatBrowser(userAgent: string) {
  return /MicroMessenger/i.test(userAgent)
}

export function WeChatBrowserNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(isWeChatBrowser(window.navigator.userAgent))
  }, [])

  if (!visible) return null

  return (
    <div className="ss-wechat-notice" role="dialog" aria-modal="true" aria-labelledby="ss-wechat-notice-title">
      <div className="ss-wechat-notice-arrow" aria-hidden="true" />
      <div className="ss-wechat-notice-panel">
        <div className="ss-wechat-notice-kicker">微信内置浏览器</div>
        <h2 id="ss-wechat-notice-title">请用系统浏览器打开</h2>
        <p>
          报名、登录和付款确认在微信里可能无法正常完成。请点击右上角「...」，选择「在浏览器打开」。
        </p>
        <button type="button" className="ss-wechat-notice-button" onClick={() => setVisible(false)}>
          继续浏览
        </button>
      </div>
    </div>
  )
}
