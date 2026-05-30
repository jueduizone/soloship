import { Suspense } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDictionary, type Dictionary } from '@/lib/i18n'
import { getCurrentLocale } from '@/lib/i18n/site'

type SearchParams = Promise<{ email?: string }>

async function VerifyBody({ searchParams, dictionary: copy }: { searchParams: SearchParams; dictionary: Dictionary }) {
  const { email } = await searchParams
  return (
    <div className="ss-auth-card">
      <div className="ss-auth-success ss-auth-verify-banner" role="status">
        {copy.auth.verify.title}
      </div>
      <div className="ss-auth-title">{copy.auth.verify.title}</div>
      <div className="ss-auth-sub">{copy.auth.verify.body}</div>

      {email && (
        <div className="ss-auth-verify-email">
          <span className="ss-auth-verify-label">{copy.auth.verify.sentTo}</span>
          <span className="ss-auth-verify-addr">{email}</span>
        </div>
      )}

      <div className="ss-auth-verify-steps">
        <div className="ss-auth-verify-steps-title">{copy.auth.verify.nextSteps}</div>
        <ol>
          <li>{copy.auth.verify.step1}</li>
          <li>{copy.auth.verify.step2}</li>
          <li>{copy.auth.verify.step3}</li>
        </ol>
      </div>

      <details className="ss-auth-verify-help">
        <summary>{copy.auth.verify.noEmail}</summary>
        <div className="ss-auth-verify-help-body">{copy.auth.verify.noEmailHint}</div>
      </details>

      <div className="ss-auth-foot">
        <Link href="/auth/login">{copy.auth.verify.backToLogin}</Link>
      </div>
    </div>
  )
}

export default function VerifyPage({ searchParams }: { searchParams: SearchParams }) {
  const dictionary = getDictionary(getCurrentLocale(cookies()))

  return (
    <Suspense fallback={<div className="ss-auth-card">{dictionary.common.loading}</div>}>
      <VerifyBody searchParams={searchParams} dictionary={dictionary} />
    </Suspense>
  )
}
