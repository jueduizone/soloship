'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Dictionary } from '@/lib/i18n'
import type { SiteLocale } from '@/lib/i18n/site'
import { mapAuthError, type MappedAuthError } from '@/lib/i18n/auth-errors'

type Mode = 'signin' | 'signup'
type OAuthProvider = 'google' | 'github'

type GoogleCredentialResponse = {
  credential?: string
  select_by?: string
}

type GoogleIdentityServices = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string
        callback: (response: GoogleCredentialResponse) => void
        auto_select?: boolean
        cancel_on_tap_outside?: boolean
        use_fedcm_for_prompt?: boolean
      }) => void
      renderButton: (parent: HTMLElement, options: {
        type?: 'standard' | 'icon'
        theme?: 'outline' | 'filled_blue' | 'filled_black'
        size?: 'large' | 'medium' | 'small'
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
        shape?: 'rectangular' | 'pill' | 'circle' | 'square'
        logo_alignment?: 'left' | 'center'
        locale?: string
        width?: number
      }) => void
      prompt: (listener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityServices
  }
}

const enableGitHubOAuth = true
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '280149383110-1tng3ht7524o2qlq0oaq7k7bkkn6j0pl.apps.googleusercontent.com'

type LoginClientProps = {
  dictionary: Dictionary
  locale: SiteLocale
}

export function LoginClient(props: LoginClientProps) {
  return <LoginForm {...props} />
}

function LoginForm({ dictionary: copy, locale }: LoginClientProps) {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') ?? '/apply'
  const callbackError = search.get('error')
  const supabase = useMemo(() => createClient(), [])
  const googleButtonRef = useRef<HTMLDivElement | null>(null)

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<MappedAuthError | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [googleButtonReady, setGoogleButtonReady] = useState(false)
  const [oauthPending, setOauthPending] = useState<OAuthProvider | null>(null)
  const [pending, startTransition] = useTransition()

  const completeLogin = useCallback(() => {
    router.push(next)
    router.refresh()
  }, [next, router])

  // OAuth/email callback pushes us back with ?error=<english>. Translate it
  // through the same mapper so users never see raw Supabase English strings
  // like "Invalid login credentials" / "Email address ... is invalid".
  useEffect(() => {
    if (callbackError) {
      setError(mapAuthError({ message: callbackError }, copy))
    }
  }, [callbackError, copy])

  const originRedirect = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    // After OAuth returns to /auth/callback, it will forward to `next`
    return `${base}/auth/callback?next=${encodeURIComponent(next)}`
  }

  const handleGoogleCredential = useCallback(async (response: GoogleCredentialResponse) => {
    setError(null)
    setNotice(null)
    setOauthPending('google')
    const token = response.credential
    if (!token) {
      setOauthPending(null)
      setError({ message: copy.auth.login.googleMissingCredential, suggestOAuth: false })
      return
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token,
    })
    if (error) {
      setOauthPending(null)
      setError(mapAuthError(error, copy))
      return
    }
    completeLogin()
  }, [completeLogin, copy, supabase])

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const renderGoogleButton = () => {
      if (cancelled) return
      const google = window.google?.accounts?.id
      const container = googleButtonRef.current
      if (!google || !container) {
        timer = setTimeout(renderGoogleButton, 150)
        return
      }

      google.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
      })
      container.innerHTML = ''
      setGoogleButtonReady(false)
      google.renderButton(container, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        locale: locale === 'en' ? 'en' : 'zh_CN',
        width: Math.min(376, container.offsetWidth || 376),
      })

      const markReady = () => {
        if (!cancelled && container.querySelector('iframe')) {
          setGoogleButtonReady(true)
        }
      }
      requestAnimationFrame(markReady)
      setTimeout(markReady, 250)
    }

    renderGoogleButton()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [handleGoogleCredential, locale])

  const handleOAuth = async (provider: 'github') => {
    setError(null)
    setNotice(null)
    setOauthPending(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: originRedirect() },
    })
    if (error) {
      setOauthPending(null)
      setError(mapAuthError(error, copy))
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    startTransition(async () => {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { setError(mapAuthError(error, copy)); return }
        completeLogin()
      } else {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: originRedirect() },
          })
          if (error) { setError(mapAuthError(error, copy)); return }
          if (!data?.user) {
            setError({ message: copy.auth.login.signUpFailedGeneric, suggestOAuth: false })
            return
          }
          // Only redirect to the verify page when we have POSITIVE proof the
          // signup actually went through. Supabase's anti-enumeration masks
          // already-registered emails by returning a fake user with no
          // session, no confirmation_sent_at, and (in some configurations)
          // no identities. Checking for any single signal (e.g. identities
          // alone) is fragile — different Supabase versions surface the
          // fake response differently, which caused OPE-61.
          const user = data.user as typeof data.user & {
            confirmation_sent_at?: string | null
            email_confirmed_at?: string | null
          }
          const hasSession = !!data.session
          const confirmationSent = !!user.confirmation_sent_at
          const hasIdentity = (user.identities ?? []).length > 0
          const autoConfirmed = !!user.email_confirmed_at

          if (!hasSession && !confirmationSent && !autoConfirmed && !hasIdentity) {
            setError({ message: copy.auth.errors.userAlreadyRegistered, suggestOAuth: false })
            return
          }
          // If no confirmation email was dispatched and there's no session,
          // we're likely hitting a partial/fake response — don't claim
          // success. This also covers the case where Supabase's SDK swallows
          // a 400 into a data shape without throwing.
          if (!hasSession && !confirmationSent && !autoConfirmed) {
            setError({ message: copy.auth.errors.userAlreadyRegistered, suggestOAuth: false })
            return
          }
          router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
        } catch (err) {
          setError(mapAuthError(err, copy))
        }
      }
    })
  }

  return (
    <div className="ss-auth-card">
      <div className="ss-auth-title">{copy.auth.login.title}</div>
      <div className="ss-auth-sub">{copy.auth.login.subtitle}</div>

      {next.startsWith('/apply') && (
        <div className="ss-auth-context">
          <div className="ss-auth-context-title">{copy.auth.login.applyNotice.title}</div>
          <div className="ss-auth-context-body">{copy.auth.login.applyNotice.body}</div>
        </div>
      )}

      {error && (
        <div className="ss-auth-error" role="alert">
          <div>{error.message}</div>
          {error.suggestOAuth && (
            <div className="ss-auth-error-hint">
              {copy.auth.login.errors.rateLimitOAuthHint}
              <div className="ss-auth-error-actions">
                <button
                  type="button"
                  className="ss-btn ss-btn-ghost ss-btn-sm"
                  disabled={!googleButtonReady}
                >
                  <GoogleMark /> {googleButtonReady ? copy.auth.login.google : copy.auth.login.googleLoading}
                </button>
                {enableGitHubOAuth && (
                  <button
                    type="button"
                    className="ss-btn ss-btn-ghost ss-btn-sm"
                    onClick={() => handleOAuth('github')}
                  >
                    <GitHubMark /> {copy.auth.login.github}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {notice && <div className="ss-auth-success">{notice}</div>}

      <div className="ss-oauth-row">
        <div className={`ss-google-button ${googleButtonReady ? 'is-ready' : 'is-loading'} ${oauthPending === 'google' ? 'is-pending' : ''}`} aria-label={copy.auth.login.google} aria-busy={oauthPending === 'google'}>
          <div className="ss-oauth-btn ss-google-visual-btn" aria-hidden="true">
            {oauthPending === 'google' ? <span className="ss-auth-spinner" /> : <GoogleMark />}
            {oauthPending === 'google' ? copy.auth.login.signingIn : googleButtonReady ? copy.auth.login.google : copy.auth.login.googleLoading}
          </div>
          <div className="ss-google-native-button" ref={googleButtonRef} />
        </div>
        {enableGitHubOAuth && (
          <button type="button" className="ss-oauth-btn" onClick={() => handleOAuth('github')} disabled={oauthPending !== null} aria-busy={oauthPending === 'github'}>
            {oauthPending === 'github' ? <span className="ss-auth-spinner" /> : <GitHubMark />}
            {oauthPending === 'github' ? copy.auth.login.githubRedirecting : copy.auth.login.github}
          </button>
        )}
      </div>

      <div className="ss-divider-labeled">{copy.auth.login.divider}</div>

      <div className="ss-tabs">
        <button
          type="button"
          className={`ss-tab ${mode === 'signin' ? 'is-active' : ''}`}
          onClick={() => { setMode('signin'); setError(null); setNotice(null) }}
        >
          {copy.auth.login.emailTab}
        </button>
        <button
          type="button"
          className={`ss-tab ${mode === 'signup' ? 'is-active' : ''}`}
          onClick={() => { setMode('signup'); setError(null); setNotice(null) }}
        >
          {copy.auth.login.signUpTab}
        </button>
      </div>

      <form onSubmit={handleEmail}>
        <div className="ss-field">
          <label htmlFor="email">{copy.auth.login.email}</label>
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
          <label htmlFor="password">{copy.auth.login.password}</label>
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
        <button type="submit" className="ss-btn ss-btn-primary ss-btn-block" disabled={pending || oauthPending !== null} aria-busy={pending}>
          {pending ? (
            <span className="ss-loading-label"><span className="ss-auth-spinner" />{mode === 'signin' ? copy.auth.login.signingIn : copy.auth.login.signingUp}</span>
          ) : mode === 'signin' ? copy.auth.login.submitLogin : copy.auth.login.submitSignUp}
        </button>
      </form>

      <div className="ss-auth-foot">
        <Link href="/">{copy.auth.login.backToHome}</Link>
      </div>
    </div>
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
