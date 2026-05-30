import { zh } from './zh'
import { en } from './en'
import type { SiteLocale } from './site'

type DeepWiden<T> = T extends string
  ? string
  : T extends (...args: never[]) => unknown
    ? T
  : T extends object
    ? { [K in keyof T]: DeepWiden<T[K]> }
    : T

export const locale = 'zh-CN' as const
export type Locale = SiteLocale

export type Dictionary = DeepWiden<typeof zh>
export const t: Dictionary = zh

export const dictionaries = {
  zh,
  en,
} as const satisfies Record<SiteLocale, Dictionary>

export function getDictionary(locale: SiteLocale): Dictionary {
  return dictionaries[locale] ?? zh
}
