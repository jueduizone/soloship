'use client'

import { useState, useTransition } from 'react'
import type { BenefitType } from '@/lib/db/types'

interface ClaimBenefitButtonProps {
  benefitId: string
  type: BenefitType
  label: string
  pendingLabel: string
  claimedLabel: string
  payloadLabels: {
    recipient: string
    phone: string
    address: string
    note: string
  }
}

export function ClaimBenefitButton({
  benefitId,
  type,
  label,
  pendingLabel,
  claimedLabel,
  payloadLabels,
}: ClaimBenefitButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    setMessage(null)
    startTransition(async () => {
      const payload = type === 'merch'
        ? {
            recipient: String(formData.get('recipient') ?? ''),
            phone: String(formData.get('phone') ?? ''),
            address: String(formData.get('address') ?? ''),
            note: String(formData.get('note') ?? ''),
          }
        : {}

      const response = await fetch(`/api/benefits/${benefitId}/claim`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payload }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof data.error === 'string' ? data.error : '领取失败')
        return
      }
      setCode(typeof data.code === 'string' ? data.code : null)
      setMessage(claimedLabel)
    })
  }

  return (
    <form action={onSubmit} className="ss-benefit-claim-form">
      {type === 'merch' && (
        <div className="ss-benefit-claim-fields">
          <input className="ss-input" name="recipient" placeholder={payloadLabels.recipient} required />
          <input className="ss-input" name="phone" placeholder={payloadLabels.phone} required />
          <textarea className="ss-textarea" name="address" placeholder={payloadLabels.address} required />
          <input className="ss-input" name="note" placeholder={payloadLabels.note} />
        </div>
      )}
      <button className="ss-btn ss-btn-primary" type="submit" disabled={isPending}>
        {isPending ? pendingLabel : label}
      </button>
      {code && <div className="ss-benefit-code">{code}</div>}
      {message && <div className="ss-form-success">{message}</div>}
      {error && <div className="ss-form-error">{error}</div>}
    </form>
  )
}
