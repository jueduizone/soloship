// 将 Supabase / 浏览器返回的英文鉴权错误映射为中文提示。
// 未识别的错误落到 errors.unknown，避免英文直接露出到中文界面。
import { t } from './index'

export function mapAuthError(err: unknown): string {
  const raw =
    (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
      ? (err as { message: string }).message
      : typeof err === 'string'
        ? err
        : '') || ''
  const msg = raw.toLowerCase()
  const E = t.auth.errors

  // 邮箱/密码错误
  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
    return E.invalidCredentials
  }
  // 邮箱格式错误： "Email address xxx is invalid"
  if (msg.includes('email') && msg.includes('invalid')) {
    return E.invalidEmail
  }
  // 已注册
  if (msg.includes('already registered') || msg.includes('user already') || msg.includes('already exists')) {
    return E.userAlreadyRegistered
  }
  // 弱密码
  if (msg.includes('password') && (msg.includes('short') || msg.includes('at least') || msg.includes('weak'))) {
    return E.weakPassword
  }
  // 邮箱未验证
  if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
    return E.emailNotConfirmed
  }
  // 限流
  if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('for security purposes')) {
    return E.rateLimited
  }
  // 注册关闭
  if (msg.includes('signups not allowed') || msg.includes('signup is disabled') || msg.includes('signups disabled')) {
    return E.signupDisabled
  }
  // OAuth 类
  if (msg.includes('oauth') || msg.includes('provider')) {
    return E.oauthFailed
  }
  return E.unknown
}
