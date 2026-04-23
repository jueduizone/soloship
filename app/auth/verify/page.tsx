import { Suspense } from 'react'
import Link from 'next/link'
import { t } from '@/lib/i18n'

type SearchParams = Promise<{ email?: string }>

async function VerifyBody({ searchParams }: { searchParams: SearchParams }) {
  const { email } = await searchParams
  return (
    <div className="ss-auth-card">
      <div className="ss-auth-success ss-auth-verify-banner" role="status">
        ✓ {t.auth.verify.title}
      </div>
      <div className="ss-auth-title">{t.auth.verify.title}</div>
      <div className="ss-auth-sub">{t.auth.verify.body}</div>

      {email && (
        <div className="ss-auth-verify-email">
          <span className="ss-auth-verify-label">{t.auth.verify.sentTo}</span>
          <span className="ss-auth-verify-addr">{email}</span>
        </div>
      )}

      <div className="ss-auth-verify-steps">
        <div className="ss-auth-verify-steps-title">{t.auth.verify.nextSteps}</div>
        <ol>
          <li>{t.auth.verify.step1}</li>
          <li>{t.auth.verify.step2}</li>
          <li>{t.auth.verify.step3}</li>
        </ol>
      </div>

      <details className="ss-auth-verify-help">
        <summary>{t.auth.verify.noEmail}</summary>
        <div className="ss-auth-verify-help-body">{t.auth.verify.noEmailHint}</div>
      </details>

      <div className="ss-auth-foot">
        <Link href="/auth/login">{t.auth.verify.backToLogin}</Link>
      </div>
    </div>
  )
}

export default function VerifyPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="ss-auth-card">{t.common.loading}</div>}>
      <VerifyBody searchParams={searchParams} />
    </Suspense>
  )
}
