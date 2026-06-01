import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isOrganizerUser } from '@/lib/auth/require-organizer'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationForApplicant } from '@/lib/db/registrations'
import {
  BENEFIT_CLAIM_STATUS_LABEL,
  BENEFIT_TYPE_LABEL,
  listBenefitsForViewer,
} from '@/lib/db/benefits'
import { getCurrentLocale } from '@/lib/i18n/site'
import type { SiteLocale } from '@/app/_components/content'
import { ClaimBenefitButton } from './ClaimBenefitButton'

export const dynamic = 'force-dynamic'

const BENEFITS_COPY: Record<SiteLocale, {
  backHome: string
  eyebrow: string
  title: string
  subtitle: string
  lockedTitle: string
  lockedBody: string
  status: string
  empty: string
  claim: string
  claiming: string
  claimed: string
  claimedAt: string
  instructions: string
  redeem: string
  code: string
  stock: string
  payload: {
    recipient: string
    phone: string
    address: string
    note: string
  }
}> = {
  zh: {
    backHome: '← SoloShip',
    eyebrow: 'SoloShip Vol.1 · Benefits',
    title: '福利领取中心',
    subtitle: '这里集中领取大模型 Token、赞助商权益和周边。仅已确认付款的入营用户可领取。',
    lockedTitle: '仅已付费入营用户可领取',
    lockedBody: '福利会在付款确认后开放。如果你已经付款但仍看不到，请联系志愿者核对报名状态。',
    status: '查看申请状态',
    empty: '暂无可领取福利。新的赞助权益和周边会陆续放到这里。',
    claim: '领取',
    claiming: '领取中',
    claimed: '已领取，刷新页面后可查看最新状态。',
    claimedAt: '领取状态',
    instructions: '领取说明',
    redeem: '打开领取链接 ↗',
    code: '你的兑换码',
    stock: '剩余兑换码',
    payload: {
      recipient: '收件人姓名',
      phone: '手机号',
      address: '收件地址',
      note: '尺码 / 备注（可选）',
    },
  },
  en: {
    backHome: '← SoloShip',
    eyebrow: 'SoloShip Vol.1 · Benefits',
    title: 'Benefits Center',
    subtitle: 'Claim model tokens, sponsor perks, and merch here. Benefits are available to paid cohort members only.',
    lockedTitle: 'Paid members only',
    lockedBody: 'Benefits unlock after your payment is confirmed. If you have paid but still cannot access this page, contact the volunteer team.',
    status: 'View application status',
    empty: 'No claimable benefits yet. Sponsor perks and merch will appear here as they are ready.',
    claim: 'Claim',
    claiming: 'Claiming',
    claimed: 'Claimed. Refresh the page to see the latest status.',
    claimedAt: 'Claim status',
    instructions: 'Instructions',
    redeem: 'Open redeem link ↗',
    code: 'Your redeem code',
    stock: 'Codes left',
    payload: {
      recipient: 'Recipient name',
      phone: 'Phone',
      address: 'Shipping address',
      note: 'Size / note (optional)',
    },
  },
}

export default async function BenefitsPage() {
  const locale = getCurrentLocale(cookies())
  const copy = BENEFITS_COPY[locale]
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/benefits')
  }

  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const registration = user.email
    ? await getRegistrationForApplicant(admin, {
        userId: user.id,
        email: user.email,
        eventId: event.id,
      })
    : null
  const canSeeBenefits = registration?.status === 'paid' || isOrganizerUser(user)
  const benefits = await listBenefitsForViewer(admin, event.id, {
    userId: user.id,
    canSeeBenefits,
  })

  return (
    <div className="ss-apply-container ss-benefits-container">
      <div className="ss-resource-topbar">
        <Link href="/">{copy.backHome}</Link>
      </div>

      <header className="ss-apply-header">
        <span className="ss-eyebrow">{copy.eyebrow}</span>
        <h1 className="ss-apply-title">{copy.title}</h1>
        <p className="ss-apply-sub">{copy.subtitle}</p>
      </header>

      {!canSeeBenefits ? (
        <div className="ss-apply-card" style={{ marginTop: 24 }}>
          <h2 className="ss-benefit-lock-title">{copy.lockedTitle}</h2>
          <p className="ss-apply-sub" style={{ marginTop: 10 }}>{copy.lockedBody}</p>
          <Link href="/apply/status" className="ss-btn ss-btn-primary" style={{ marginTop: 18 }}>
            {copy.status}
          </Link>
        </div>
      ) : benefits.length === 0 ? (
        <div className="ss-apply-card" style={{ marginTop: 24 }}>
          <div className="ss-callout" style={{ marginTop: 0 }}>{copy.empty}</div>
        </div>
      ) : (
        <div className="ss-benefit-grid">
          {benefits.map(benefit => (
            <article className="ss-benefit-card" key={benefit.id}>
              <div className="ss-benefit-card-head">
                <div>
                  <div className="ss-resource-meta">
                    <span className="ss-resource-pill">{BENEFIT_TYPE_LABEL[benefit.type]}</span>
                    {benefit.provider && <span className="ss-resource-pill">{benefit.provider}</span>}
                  </div>
                  <h2 className="ss-benefit-title">{benefit.title}</h2>
                </div>
                {benefit.available_code_count != null && (
                  <div className="ss-benefit-stock">
                    <span>{copy.stock}</span>
                    <strong>{benefit.available_code_count}</strong>
                  </div>
                )}
              </div>

              {benefit.description && <p className="ss-resource-summary">{benefit.description}</p>}
              {benefit.claim_instructions && (
                <div className="ss-benefit-instructions">
                  <strong>{copy.instructions}</strong>
                  <span>{benefit.claim_instructions}</span>
                </div>
              )}

              {benefit.claim ? (
                <div className="ss-benefit-claimed">
                  <span>{copy.claimedAt}</span>
                  <strong>{BENEFIT_CLAIM_STATUS_LABEL[benefit.claim.status]}</strong>
                  {benefit.assigned_code && (
                    <div className="ss-benefit-code-block">
                      <span>{copy.code}</span>
                      <code>{benefit.assigned_code}</code>
                    </div>
                  )}
                  {benefit.redeem_url && (
                    <a className="ss-resource-link" href={benefit.redeem_url} target="_blank" rel="noreferrer">
                      {copy.redeem}
                    </a>
                  )}
                  {benefit.claim.tracking_info && <p>{benefit.claim.tracking_info}</p>}
                </div>
              ) : (
                <ClaimBenefitButton
                  benefitId={benefit.id}
                  type={benefit.type}
                  label={copy.claim}
                  pendingLabel={copy.claiming}
                  claimedLabel={copy.claimed}
                  payloadLabels={copy.payload}
                />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
