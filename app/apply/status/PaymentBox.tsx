'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Dictionary } from '@/lib/i18n'

export function PaymentBox({
  registrationId,
  amountCents,
  currency,
  copy,
}: {
  registrationId: string
  amountCents: number
  currency: string
  copy: Dictionary
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: registrationId, note: '' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? copy.apply.paymentBox.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div className="ss-eyebrow" style={{ marginBottom: 8 }}>{copy.apply.paymentBox.title}</div>

      <dl className="ss-kv">
        <dt>{copy.apply.paymentBox.fee}</dt>
        <dd>
          ¥{(amountCents / 100).toFixed(0)} {currency}
          <span style={{ color: 'var(--ss-text-dim)', marginLeft: 8, fontSize: 13 }}>
            {copy.apply.paymentBox.feeNote}
          </span>
        </dd>
        <dt>{copy.apply.paymentBox.method}</dt>
        <dd>
          {copy.apply.paymentBox.methodBody}
        </dd>
      </dl>

      {error && <div className="ss-form-error" style={{ marginTop: 16 }}>{error}</div>}

      <button
        type="button"
        className="ss-btn ss-btn-primary ss-btn-block"
        style={{ marginTop: 20 }}
        onClick={submit}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? (
          <span className="ss-loading-label"><span className="ss-auth-spinner" />{copy.apply.paymentBox.submitting}</span>
        ) : copy.apply.paymentBox.submit}
      </button>
    </div>
  )
}
