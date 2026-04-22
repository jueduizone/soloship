'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function PaymentBox({
  registrationId,
  amountCents,
  currency,
}: {
  registrationId: string
  amountCents: number
  currency: string
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
        setError(data?.error ?? '提交失败')
        return
      }
      router.refresh()
    })
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div className="ss-eyebrow" style={{ marginBottom: 8 }}>付款</div>

      <dl className="ss-kv">
        <dt>费用</dt>
        <dd>
          ¥{(amountCents / 100).toFixed(0)} {currency}
          <span style={{ color: 'var(--ss-text-dim)', marginLeft: 8, fontSize: 13 }}>
            完成 30 天挑战后全额退还
          </span>
        </dd>
        <dt>收款方式</dt>
        <dd>
          微信号：<span style={{ fontWeight: 600 }}>soloship_pay</span>
          <div style={{ color: 'var(--ss-text-dim)', fontSize: 13, marginTop: 4 }}>
            添加微信后转账备注邮箱即可
          </div>
        </dd>
      </dl>

      {error && <div className="ss-form-error" style={{ marginTop: 16 }}>{error}</div>}

      <button
        type="button"
        className="ss-btn ss-btn-primary ss-btn-block"
        style={{ marginTop: 20 }}
        onClick={submit}
        disabled={pending}
      >
        {pending ? '…' : '我已付款，等待确认'}
      </button>
    </div>
  )
}
