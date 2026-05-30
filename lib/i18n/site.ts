import type { SiteLocale } from '@/app/_components/content'

export type { SiteLocale } from '@/app/_components/content'

export const SITE_LOCALE_COOKIE = 'soloship_locale'
export const SITE_LOCALES: SiteLocale[] = ['zh', 'en']

export function normalizeLocale(value: string | undefined | null): SiteLocale {
  return value === 'en' ? 'en' : 'zh'
}

export function getCurrentLocale(cookieStore: { get(name: string): { value: string } | undefined }): SiteLocale {
  return normalizeLocale(cookieStore.get(SITE_LOCALE_COOKIE)?.value)
}
