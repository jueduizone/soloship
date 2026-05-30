'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { SiteLocale } from './content'
import { SITE_LOCALE_COOKIE } from '@/lib/i18n/site'

const OPTIONS: Array<{ locale: SiteLocale; label: string }> = [
  { locale: 'zh', label: '中文' },
  { locale: 'en', label: 'EN' },
]

export function LanguageSwitch({ currentLocale }: { currentLocale: SiteLocale }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="ss-language-switch" aria-label="Language">
      {OPTIONS.map(option => (
        <button
          key={option.locale}
          type="button"
          aria-pressed={option.locale === currentLocale}
          disabled={isPending}
          onClick={() => {
            document.cookie = `${SITE_LOCALE_COOKIE}=${option.locale}; path=/; max-age=31536000; samesite=lax`
            startTransition(() => router.refresh())
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
