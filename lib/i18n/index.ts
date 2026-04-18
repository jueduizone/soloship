// i18n 预留结构位。MVP 只有 zh-CN，不做实际切换。
// 后续若要扩展，改成 { zh, en }.nested 即可。

import { zh } from './zh'

export const locale = 'zh-CN' as const
export type Locale = typeof locale

export const t = zh
export type Dictionary = typeof zh
