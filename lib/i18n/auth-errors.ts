// 将 Supabase / 浏览器返回的英文鉴权错误映射为中文提示。
// 未识别的错误落到 errors.unknown，避免英文直接露出到中文界面。
import { t } from './index'

export interface MappedAuthError {
  /** 中文错误提示 */
  message: string
  /** 是否建议用户改用 OAuth（限流等场景） */
  suggestOAuth: boolean
}

function extractMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message: unknown }).message
    if (typeof m === 'string') return m
  }
  if (typeof err === 'string') return err
  return ''
}
function extractStatus(err: unknown): number {
  if (err && typeof err === 'object' && 'status' in err) {
    const s = (err as { status: unknown }).status
    if (typeof s === 'number') return s
  }
  return 0
}
function extractCode(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const c = (err as { code: unknown }).code
    if (typeof c === 'string') return c.toLowerCase()
  }
  return ''
}

export function mapAuthError(err: unknown): MappedAuthError {
  const raw = extractMessage(err)
  const msg = raw.toLowerCase()
  const code = extractCode(err)
  const status = extractStatus(err)
  const E = t.auth.errors

  if (
    code === 'invalid_credentials' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid email or password') ||
    msg.includes('invalid credentials')
  ) {
    return { message: E.invalidCredentials, suggestOAuth: false }
  }
  // Supabase 有两种"邮箱相关"错误：
  // 1) email_address_invalid / 消息含 "is invalid" — 这是 Supabase 拒绝了该邮箱地址
  //    （例如 @example.com 等占位域名、或被判定为无效的地址），并非语法问题。
  //    前端 <input type="email" required> 已拦截语法级错误，所以走到这里基本都是地址拒绝。
  // 2) 真·格式错误（理论上几乎不会到这里）— 走通用 invalidEmail。
  if (
    code === 'email_address_invalid' ||
    code === 'email_address_not_authorized' ||
    (msg.includes('email') && (msg.includes('is invalid') || msg.includes('not authorized') || msg.includes('not allowed')))
  ) {
    return { message: E.emailAddressUnsupported, suggestOAuth: true }
  }
  if (msg.includes('email') && msg.includes('invalid')) {
    return { message: E.invalidEmail, suggestOAuth: false }
  }
  if (msg.includes('already registered') || msg.includes('user already') || msg.includes('already exists')) {
    return { message: E.userAlreadyRegistered, suggestOAuth: false }
  }
  if (msg.includes('password') && (msg.includes('short') || msg.includes('at least') || msg.includes('weak'))) {
    return { message: E.weakPassword, suggestOAuth: false }
  }
  if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
    return { message: E.emailNotConfirmed, suggestOAuth: false }
  }
  // Supabase 邮件限流：status 429 或 code over_email_send_rate_limit；消息含 rate limit / for security purposes
  if (
    status === 429 ||
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    msg.includes('rate limit') ||
    msg.includes('too many') ||
    msg.includes('for security purposes')
  ) {
    return { message: E.rateLimited, suggestOAuth: true }
  }
  if (msg.includes('signups not allowed') || msg.includes('signup is disabled') || msg.includes('signups disabled')) {
    return { message: E.signupDisabled, suggestOAuth: false }
  }
  if (msg.includes('oauth') || msg.includes('provider')) {
    return { message: E.oauthFailed, suggestOAuth: false }
  }
  return { message: E.unknown, suggestOAuth: false }
}
