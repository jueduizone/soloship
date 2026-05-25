import crypto from 'node:crypto'

export type TencentVodConfig = {
  appId: number
  playerKey: string
  licenseUrl: string | null
  contentInfo: PlayerSignaturePayload['contentInfo']
}

export type TencentVodPlayback = {
  provider: 'tencent-vod'
  appId: number
  fileId: string
  psign: string
  licenseUrl: string | null
  expiresAt: string
}

type JwtHeader = {
  alg: 'HS256'
  typ: 'JWT'
}

type PlayerSignaturePayload = {
  appId: number
  fileId: string
  contentInfo: {
    audioVideoType: 'Original' | 'Transcode' | 'RawAdaptive' | 'ProtectedAdaptive'
    [key: string]: string | number | boolean | null
  }
  currentTimeStamp: number
  expireTimeStamp: number
  urlAccessInfo?: {
    t: string
  }
}

function base64Url(input: Buffer | string) {
  return Buffer
    .from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function signJwt(payload: PlayerSignaturePayload, key: string) {
  const header: JwtHeader = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64Url(JSON.stringify(header))
  const encodedPayload = base64Url(JSON.stringify(payload))
  const unsignedToken = `${encodedHeader}.${encodedPayload}`
  const signature = crypto
    .createHmac('sha256', key)
    .update(unsignedToken)
    .digest()

  return `${unsignedToken}.${base64Url(signature)}`
}

function parseContentInfo(): PlayerSignaturePayload['contentInfo'] {
  const raw = process.env.TENCENT_VOD_CONTENT_INFO
  if (!raw) return { audioVideoType: 'Original' }

  try {
    const parsed = JSON.parse(raw) as PlayerSignaturePayload['contentInfo']
    if (!parsed || typeof parsed !== 'object' || !parsed.audioVideoType) {
      throw new Error('TENCENT_VOD_CONTENT_INFO must include audioVideoType')
    }
    return parsed
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid JSON'
    throw new Error(`Invalid TENCENT_VOD_CONTENT_INFO: ${message}`)
  }
}

export function getTencentVodConfig(): TencentVodConfig {
  const rawAppId = process.env.TENCENT_VOD_APP_ID
  const playerKey = process.env.TENCENT_VOD_PLAYER_KEY

  if (!rawAppId || !playerKey) {
    throw new Error('Missing TENCENT_VOD_APP_ID or TENCENT_VOD_PLAYER_KEY')
  }

  const appId = Number(rawAppId)
  if (!Number.isSafeInteger(appId) || appId <= 0) {
    throw new Error('Invalid TENCENT_VOD_APP_ID')
  }

  return {
    appId,
    playerKey,
    licenseUrl: process.env.NEXT_PUBLIC_TENCENT_VOD_LICENSE_URL ?? null,
    contentInfo: parseContentInfo(),
  }
}

export function createTencentVodPlayback(
  fileId: string,
  options: {
    expiresInSeconds?: number
    config?: TencentVodConfig
  } = {}
): TencentVodPlayback {
  const config = options.config ?? getTencentVodConfig()
  const now = Math.floor(Date.now() / 1000)
  const expiresInSeconds = options.expiresInSeconds ?? 15 * 60
  const expiresAt = now + expiresInSeconds
  const psign = signJwt({
    appId: config.appId,
    fileId,
    contentInfo: config.contentInfo,
    currentTimeStamp: now,
    expireTimeStamp: expiresAt,
  }, config.playerKey)

  return {
    provider: 'tencent-vod',
    appId: config.appId,
    fileId,
    psign,
    licenseUrl: config.licenseUrl,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
  }
}

export function parseTencentVodFileId(url: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  if (/^\d+$/.test(trimmed)) return trimmed

  try {
    const parsed = new URL(trimmed)
    const fileId = parsed.searchParams.get('fileId') ?? parsed.searchParams.get('file_id')
    if (fileId && /^\d+$/.test(fileId)) return fileId
  } catch {
    return null
  }

  return null
}
