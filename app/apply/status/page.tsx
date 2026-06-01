import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import { getLatestPaymentForRegistration } from '@/lib/db/payments'
import { getDictionary } from '@/lib/i18n'
import { getCurrentLocale } from '@/lib/i18n/site'
import { PaymentBox } from './PaymentBox'

export const dynamic = 'force-dynamic'

export default async function StatusPage() {
  const locale = getCurrentLocale(cookies())
  const copy = getDictionary(locale)
  const statusCopy = copy.apply.status
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/apply/status')

  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const reg = user.email
    ? await getRegistrationForApplicant(admin, {
        userId: user.id,
        email: user.email,
        eventId: event.id,
      })
    : null

  if (!reg) {
    return (
      <div className="ss-apply-container">
        <div className="ss-topbar">
          <Link href="/">← SoloShip</Link>
          <span>{statusCopy.queryEmail}{user.email}</span>
        </div>
        <header className="ss-apply-header">
          <h1 className="ss-apply-title">{statusCopy.title}</h1>
          <p className="ss-apply-sub">{statusCopy.empty}</p>
        </header>
        <Link href="/apply" className="ss-btn ss-btn-primary">
          {statusCopy.goApply}
        </Link>
      </div>
    )
  }

  const payment = ['payment_pending', 'paid'].includes(reg.status)
    ? await getLatestPaymentForRegistration(supabase, reg.id)
    : null
  const showPaymentBox = reg.status === 'admitted'

  return (
    <div className="ss-apply-container">
      <div className="ss-topbar">
        <Link href="/">← SoloShip</Link>
        <span>{statusCopy.queryEmail}{user.email}</span>
      </div>

      <header className="ss-apply-header">
        <span className="ss-eyebrow">{event.name} · {event.subtitle}</span>
        <h1 className="ss-apply-title">{statusCopy.title}</h1>
        <p className="ss-apply-sub">
          {statusCopy.intro}
        </p>
      </header>

      <div className="ss-apply-card">
        <span className="ss-status-pill" data-kind={reg.status}>
          {statusCopy.labels[reg.status]}
        </span>

        <div className="ss-callout">{statusCopy.explain[reg.status]}</div>

        <dl className="ss-kv">
          <dt>{statusCopy.fields.name}</dt><dd>{reg.name}</dd>
          <dt>{statusCopy.fields.email}</dt><dd>{reg.email}</dd>
          {reg.city && (<><dt>{statusCopy.fields.city}</dt><dd>{reg.city}</dd></>)}
          {reg.build_direction && (<><dt>{statusCopy.fields.direction}</dt><dd>{reg.build_direction}</dd></>)}
          <dt>{statusCopy.fields.submittedAt}</dt>
          <dd>{new Date(reg.submitted_at).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}</dd>
        </dl>

        {showPaymentBox && (
          <PaymentBox
            registrationId={reg.id}
            amountCents={event.price_cents}
            currency={event.currency}
            copy={copy}
          />
        )}

        {reg.status === 'payment_pending' && (
          <div style={{ marginTop: 24 }}>
            <div className="ss-eyebrow" style={{ marginBottom: 8 }}>{statusCopy.payment.title}</div>
            <div className="ss-callout" style={{ marginTop: 0 }}>
              {statusCopy.payment.pendingBody}
            </div>
            {payment && (
              <dl className="ss-kv">
                <dt>{statusCopy.fields.amount}</dt>
                <dd>¥{(payment.amount_cents / 100).toFixed(2)} {payment.currency}</dd>
                <dt>{statusCopy.fields.state}</dt>
                <dd>{statusCopy.payment.pendingState}</dd>
              </dl>
            )}
          </div>
        )}

        {reg.status === 'paid' && (
          <div style={{ marginTop: 24 }}>
            <div className="ss-eyebrow" style={{ marginBottom: 8 }}>{statusCopy.payment.paidTitle}</div>
            <div className="ss-callout" style={{ marginTop: 0 }}>
              {statusCopy.payment.paidBody}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
              <Link href="/profile" className="ss-btn ss-btn-primary">{statusCopy.payment.editProfile}</Link>
              <Link href="/fellows" className="ss-btn ss-btn-ghost">{statusCopy.payment.fellows}</Link>
              <Link href="/benefits" className="ss-btn ss-btn-ghost">{statusCopy.payment.benefits}</Link>
            </div>
            {payment && (
              <dl className="ss-kv">
                <dt>{statusCopy.fields.amount}</dt>
                <dd>¥{(payment.amount_cents / 100).toFixed(2)} {payment.currency}</dd>
                <dt>{statusCopy.fields.state}</dt>
                <dd>{statusCopy.payment.confirmedState}</dd>
                {payment.confirmed_at && (
                  <>
                    <dt>{statusCopy.fields.confirmedAt}</dt>
                    <dd>{new Date(payment.confirmed_at).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}</dd>
                  </>
                )}
              </dl>
            )}
          </div>
        )}

        {['admitted', 'payment_pending', 'paid'].includes(reg.status) && (
          <div style={{ marginTop: 24 }}>
            <div className="ss-eyebrow" style={{ marginBottom: 8 }}>{statusCopy.payment.resourcesTitle}</div>
            <div className="ss-callout" style={{ marginTop: 0 }}>
              {statusCopy.payment.resourcesBody}
            </div>
            <div style={{ marginTop: 16 }}>
              <Link href="/resources" className="ss-btn ss-btn-primary">{statusCopy.payment.resources}</Link>
            </div>
          </div>
        )}

        {['submitted', 'reviewing'].includes(reg.status) && (
          <div style={{ marginTop: 24 }}>
            <Link href="/apply?edit=1" className="ss-btn ss-btn-ghost">{statusCopy.payment.edit}</Link>
          </div>
        )}
      </div>
    </div>
  )
}
