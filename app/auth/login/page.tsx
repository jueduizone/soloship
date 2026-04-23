'use client'

import { Suspense, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { t } from '@/lib/i18n'
import { mapAuthError, type MappedAuthError } from '@/lib/i18n/auth-errors'

type Mode = 'signin' | 'signup'

function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') ?? '/apply'
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<MappedAuthError | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const originRedirect = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    // After OAuth returns to /auth/callback, it will forward to `next`
    return `${base}/auth/callback?next=${encodeURIComponent(next)}`
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null)
    // TODO(supabase): 确认 Dashboard → Authentication → Providers 里
    // 已开启对应 provider 并填好 client_id / client_secret。
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: originRedirect() },
    })
    if (error) setError(mapAuthError(error))
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    startTransition(async () => {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { setError(mapAuthError(error)); return }
        router.push(next)
        router.refresh()
      } else {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: originRedirect() },
          })
          if (error) { setError(mapAuthError(error)); return }
          // Supabase 的「邮箱已注册」防枚举行为：不会返回 error，而是返回
          // data.user 带空 identities 数组（且无 session）。必须手动识别，
          // 否则会误导用户「注册成功，请查邮件」。
          if (!data?.user) {
            setError({ message: t.auth.login.signUpFailedGeneric, suggestOAuth: false })
            return
          }
          const identities = data.user.identities ?? []
          if (identities.length === 0 && !data.session) {
            setError({ message: t.auth.errors.userAlreadyRegistered, suggestOAuth: false })
            return
          }
          // 注册成功：跳转到 /auth/verify 显眼落地页，避免用户停在原表单
          // 上以为没反应（OPE-83）。邮箱通过 query 透传用于提示。
          router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
        } catch (err) {
          setError(mapAuthError(err))
        }
      }
    })
  }

  return (
    <div className="ss-auth-card">
      <div className="ss-auth-title">{t.auth.login.title}</div>
      <div className="ss-auth-sub">{t.auth.login.subtitle}</div>

      {next.startsWith('/apply') && (
        <div className="ss-auth-context">
          <div className="ss-auth-context-title">{t.auth.login.applyNotice.title}</div>
          <div className="ss-auth-context-body">{t.auth.login.applyNotice.body}</div>
        </div>
      )}

      {error && (
        <div className="ss-auth-error" role="alert">
          <div>{error.message}</div>
          {error.suggestOAuth && (
            <div className="ss-auth-error-hint">
              {t.auth.login.errors.rateLimitOAuthHint}
              <div className="ss-auth-error-actions">
                <button
                  type="button"
                  className="ss-btn ss-btn-ghost ss-btn-sm"
                  onClick={() => handleOAuth('google')}
                >
                  <GoogleMark /> {t.auth.login.google}
                </button>
                <button
                  type="button"
                  className="ss-btn ss-btn-ghost ss-btn-sm"
                  onClick={() => handleOAuth('github')}
                >
                  <GitHubMark /> {t.auth.login.github}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {notice && <div className="ss-auth-success">{notice}</div>}

      <div className="ss-oauth-row">
        <button type="button" className="ss-oauth-btn" onClick={() => handleOAuth('google')}>
          <GoogleMark /> {t.auth.login.google}
        </button>
        <button type="button" className="ss-oauth-btn" onClick={() => handleOAuth('github')}>
          <GitHubMark /> {t.auth.login.github}
        </button>
      </div>

      <div className="ss-divider-labeled">or</div>

      <div className="ss-tabs">
        <button
          type="button"
          className={`ss-tab ${mode === 'signin' ? 'is-active' : ''}`}
          onClick={() => { setMode('signin'); setError(null); setNotice(null) }}
        >
          {t.auth.login.emailTab}
        </button>
        <button
          type="button"
          className={`ss-tab ${mode === 'signup' ? 'is-active' : ''}`}
          onClick={() => { setMode('signup'); setError(null); setNotice(null) }}
        >
          {t.auth.login.signUpTab}
        </button>
      </div>

      <form onSubmit={handleEmail}>
        <div className="ss-field">
          <label htmlFor="email">{t.auth.login.email}</label>
          <input
            id="email"
            className="ss-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="ss-field">
          <label htmlFor="password">{t.auth.login.password}</label>
          <input
            id="password"
            className="ss-input"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="ss-btn ss-btn-primary ss-btn-block" disabled={pending}>
          {pending ? '…' : mode === 'signin' ? t.auth.login.submitLogin : t.auth.login.submitSignUp}
        </button>
      </form>

      <div className="ss-auth-foot">
        <Link href="/">{t.auth.login.backToHome}</Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="ss-auth-card">{t.common.loading}</div>}>
      <LoginForm />
    </Suspense>
  )
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function GitHubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54v-1.88c-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.01-.12-.29-.5-1.45.11-3.02 0 0 .94-.3 3.08 1.15a10.6 10.6 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.57.23 2.73.11 3.02.72.78 1.16 1.78 1.16 3.01 0 4.33-2.64 5.26-5.15 5.54.4.35.76 1.03.76 2.07v3.07c0 .3.2.65.78.54 4.47-1.5 7.68-5.7 7.68-10.67C23.25 5.48 18.27.5 12 .5z" />
    </svg>
  )
}
