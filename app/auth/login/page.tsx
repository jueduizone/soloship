import { Suspense } from 'react'
import Script from 'next/script'
import { cookies } from 'next/headers'

import { LoginClient } from './LoginClient'
import { getDictionary } from '@/lib/i18n'
import { getCurrentLocale } from '@/lib/i18n/site'

export default function LoginPage() {
  const locale = getCurrentLocale(cookies())
  const dictionary = getDictionary(locale)

  return (
    <Suspense fallback={<div className="ss-auth-card">{dictionary.common.loading}</div>}>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <LoginClient dictionary={dictionary} locale={locale} />
    </Suspense>
  )
}
