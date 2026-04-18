'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type {
  PaymentConfirmationRow,
  RegistrationStatus,
} from '@/lib/db/types'

export function AdmissionActions({
  registrationId,
  status,
}: {
  registrationId: string
  status: RegistrationStatus
}) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const terminal: RegistrationStatus[] = ['paid', 'withdrawn']
  if (terminal.includes(status)) {
    return <div style={{ color: 'var(--ss-text-dim)', fontSize: 13 }}>当前状态已不能再审核。</div>
  }

  const act = (decision: 'admit' | 'waitlist' | 'reject') => {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/registrations/${registrationId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, note: note || null }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? '操作失败')
        return
      }
      setNote('')
      router.refresh()
    })
  }

  return (
    <>
      {error && <div className="ss-form-error">{error}</div>}
      <div className="ss-field">
        <label htmlFor="note">备注（可选）</label>
        <textarea
          id="note"
          className="ss-textarea"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="审核理由 / 对申请人的反馈"
        />
      </div>
      <div className="ss-action-row">
        <button
          type="button"
          className="ss-btn-action is-primary"
          onClick={() => act('admit')}
          disabled={pending}
        >
          录取（admit）
        </button>
        <button
          type="button"
          className="ss-btn-action"
          onClick={() => act('waitlist')}
          disabled={pending}
        >
          放入候补
        </button>
        <button
          type="button"
          className="ss-btn-action is-danger"
          onClick={() => act('reject')}
          disabled={pending}
        >
          拒绝
        </button>
      </div>
    </>
  )
}

export function PaymentActions({
  registrationId,
  status,
  payment,
  defaultAmountCents,
}: {
  registrationId: string
  status: RegistrationStatus
  payment: PaymentConfirmationRow | null
  defaultAmountCents: number
}) {
  const router = useRouter()
  const [amount, setAmount] = useState(
    ((payment?.amount_cents ?? defaultAmountCents) / 100).toFixed(2)
  )
  const [channel, setChannel] = useState(payment?.channel ?? 'wechat')
  const [externalRef, setExternalRef] = useState(payment?.external_ref ?? '')
  const [note, setNote] = useState(payment?.note ?? '')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const canNotify = status === 'admitted'
  const canConfirm = status === 'payment_pending' && payment?.status === 'pending'

  if (!canNotify && !canConfirm && status !== 'paid') {
    return (
      <div style={{ color: 'var(--ss-text-dim)', fontSize: 13 }}>
        该报名当前不在可操作付款的阶段（admitted → payment_pending → paid）。
      </div>
    )
  }

  if (status === 'paid') {
    return (
      <div>
        <div className="ss-form-success">已确认到账，用户状态为「已入营」。</div>
        {payment && (
          <dl className="ss-kv">
            <dt>金额</dt>
            <dd>¥{(payment.amount_cents / 100).toFixed(2)}</dd>
            <dt>渠道</dt>
            <dd>{payment.channel ?? '—'}</dd>
            {payment.external_ref && (<><dt>流水号</dt><dd>{payment.external_ref}</dd></>)}
            {payment.confirmed_at && (
              <>
                <dt>确认时间</dt>
                <dd>{new Date(payment.confirmed_at).toLocaleString('zh-CN')}</dd>
              </>
            )}
          </dl>
        )}
      </div>
    )
  }

  const notify = () => {
    setError(null)
    startTransition(async () => {
      const cents = Math.round(Number(amount) * 100)
      if (!Number.isFinite(cents) || cents <= 0) {
        setError('金额无效'); return
      }
      const res = await fetch(`/api/admin/registrations/${registrationId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'notify', amount_cents: cents }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? '操作失败')
        return
      }
      router.refresh()
    })
  }

  const confirm = () => {
    if (!payment) return
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/registrations/${registrationId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          payment_id: payment.id,
          channel,
          external_ref: externalRef || null,
          note: note || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? '操作失败')
        return
      }
      router.refresh()
    })
  }

  return (
    <>
      {error && <div className="ss-form-error">{error}</div>}

      {canNotify && (
        <>
          <div className="ss-field">
            <label htmlFor="amount">应付金额（元）</label>
            <input
              id="amount"
              className="ss-input"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <div className="ss-field-hint">
              点击「通知付款」后，用户状态从 admitted → payment_pending。
              具体付款方式请在录取邮件里单独告知。
            </div>
          </div>
          <div className="ss-action-row">
            <button
              type="button"
              className="ss-btn-action is-primary"
              onClick={notify}
              disabled={pending}
            >
              通知付款（→ payment_pending）
            </button>
          </div>
        </>
      )}

      {canConfirm && (
        <>
          <div className="ss-field">
            <label>应付金额</label>
            <div style={{ color: 'var(--ss-text-strong)' }}>
              ¥{(payment!.amount_cents / 100).toFixed(2)} {payment!.currency}
            </div>
          </div>
          <div className="ss-field">
            <label htmlFor="channel">收款渠道</label>
            <select
              id="channel"
              className="ss-select"
              value={channel}
              onChange={e => setChannel(e.target.value)}
            >
              <option value="wechat">微信</option>
              <option value="alipay">支付宝</option>
              <option value="bank">银行转账</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div className="ss-field">
            <label htmlFor="ref">流水号 / 备注来源</label>
            <input
              id="ref"
              className="ss-input"
              value={externalRef}
              onChange={e => setExternalRef(e.target.value)}
              placeholder="例：微信账单单号 / 银行流水尾号"
            />
          </div>
          <div className="ss-field">
            <label htmlFor="pnote">内部备注</label>
            <textarea
              id="pnote"
              className="ss-textarea"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <div className="ss-action-row">
            <button
              type="button"
              className="ss-btn-action is-primary"
              onClick={confirm}
              disabled={pending}
            >
              确认到账（→ paid）
            </button>
          </div>
        </>
      )}
    </>
  )
}
