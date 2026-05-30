'use client'

import { useEffect, useState } from 'react'
import { getSiteContent, type SiteLocale } from './content'
import { normalizeLocale, SITE_LOCALE_COOKIE } from '@/lib/i18n/site'

function isWeChatBrowser(userAgent: string) {
  return /MicroMessenger/i.test(userAgent)
}

export function WeChatBrowserNotice() {
  const [visible, setVisible] = useState(false)
  const [locale, setLocale] = useState<SiteLocale>('zh')

  useEffect(() => {
    setVisible(isWeChatBrowser(window.navigator.userAgent))
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${SITE_LOCALE_COOKIE}=`))
      ?.split('=')[1]
    setLocale(normalizeLocale(cookieLocale))
  }, [])

  if (!visible) return null
  const content = getSiteContent(locale)

  return (
    <div className="ss-wechat-notice" role="dialog" aria-modal="true" aria-labelledby="ss-wechat-notice-title">
      <div className="ss-wechat-notice-arrow" aria-hidden="true" />
      <div className="ss-wechat-notice-panel">
        <div className="ss-wechat-notice-kicker">{content.wechat.kicker}</div>
        <h2 id="ss-wechat-notice-title">{content.wechat.title}</h2>
        <p>
          {content.wechat.body}
        </p>
        <button type="button" className="ss-wechat-notice-button" onClick={() => setVisible(false)}>
          {content.wechat.continue}
        </button>
      </div>
    </div>
  )
}
