export type CloudflareStreamConfig = {
  accountId: string
  apiToken: string
  customerCode: string
}

export type CloudflareStreamPlayback = {
  provider: 'cloudflare-stream'
  videoUid: string
  token: string
  iframeUrl: string
  expiresAt: string
}

type CloudflareTokenResponse = {
  success: boolean
  errors?: Array<{ message?: string }>
  result?: {
    token?: string
  }
}

export function getCloudflareStreamConfig(): CloudflareStreamConfig {
  const accountId = process.env.CLOUDFLARE_STREAM_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN
  const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE

  if (!accountId || !apiToken || !customerCode) {
    throw new Error(
      'Missing CLOUDFLARE_STREAM_ACCOUNT_ID, CLOUDFLARE_STREAM_API_TOKEN, or NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE'
    )
  }

  return { accountId, apiToken, customerCode }
}

export function parseCloudflareStreamVideoUid(url: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  if (/^[a-zA-Z0-9_-]{16,64}$/.test(trimmed)) return trimmed

  try {
    const parsed = new URL(trimmed)
    const candidates = parsed.pathname.split('/').filter(Boolean)
    const uid = candidates.find(part => /^[a-zA-Z0-9_-]{16,64}$/.test(part))
    return uid ?? null
  } catch {
    return null
  }
}

export async function createCloudflareStreamPlayback(
  videoUid: string,
  options: {
    expiresInSeconds?: number
    config?: CloudflareStreamConfig
  } = {}
): Promise<CloudflareStreamPlayback> {
  const config = options.config ?? getCloudflareStreamConfig()
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + (options.expiresInSeconds ?? 15 * 60)

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/stream/${videoUid}/token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        exp: expiresAt,
        nbf: now - 30,
        downloadable: false,
      }),
    }
  )
  const data = await res.json().catch(() => ({})) as CloudflareTokenResponse

  if (!res.ok || !data.success || !data.result?.token) {
    const message = data.errors?.map(error => error.message).filter(Boolean).join('; ')
    throw new Error(message || 'Cloudflare Stream token creation failed')
  }

  const token = data.result.token

  return {
    provider: 'cloudflare-stream',
    videoUid,
    token,
    iframeUrl: `https://customer-${config.customerCode}.cloudflarestream.com/${token}/iframe`,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
  }
}
