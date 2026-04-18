import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDefaultEvent } from '@/lib/db/events'
import { getRegistrationByUser } from '@/lib/db/registrations'
import { getLatestPaymentForRegistration } from '@/lib/db/payments'
import type { RegistrationStatus } from '@/lib/db/types'
import { t } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  submitted: '待审核',
  reviewing: '审核中',
  admitted: '已录取',
  waitlisted: '候补',
  rejected: '未录取',
  payment_pending: '待付款确认',
  paid: '已入营',
  withdrawn: '已退出',
}

const STATUS_EXPLAIN: Record<RegistrationStatus, string> = {
  submitted: '我们已经收到你的申请。3 个工作日内会完成审核，通过邮件通知你结果。',
  reviewing: '你的申请正在审核中。如无意外，将在 3 个工作日内给出结果。',
  admitted: '恭喜你被录取！我们会通过邮件发送付款方式。完成付款后本页会更新为「已入营」。',
  waitlisted: '你目前在候补名单中。如前序录取名额释放，我们会第一时间通知你。',
  rejected: '很遗憾，本期没有足够的匹配度。我们会保留你的资料，在后续招募时再联系。',
  payment_pending: '我们已经发送付款信息，请按邮件指引完成付款。到账后本页会自动变为「已入营」。',
  paid: '你已正式入营。资料和同学录入口会在开营前放出。',
  withdrawn: '你已退出本期。',
}

export default async function StatusPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/apply/status')

  const event = await getDefaultEvent(supabase)
  const reg = await getRegistrationByUser(supabase, user.id, event.id)

  if (!reg) {
    return (
      <div className="ss-apply-container">
        <div className="ss-topbar">
          <Link href="/">← SoloShip</Link>
          <span>{user.email}</span>
        </div>
        <header className="ss-apply-header">
          <h1 className="ss-apply-title">{t.apply.status.title}</h1>
          <p className="ss-apply-sub">{t.apply.status.empty}</p>
        </header>
        <Link href="/apply" className="ss-btn ss-btn-primary">
          {t.apply.status.goApply}
        </Link>
      </div>
    )
  }

  const payment = ['payment_pending', 'paid'].includes(reg.status)
    ? await getLatestPaymentForRegistration(supabase, reg.id)
    : null

  return (
    <div className="ss-apply-container">
      <div className="ss-topbar">
        <Link href="/">← SoloShip</Link>
        <span>{user.email}</span>
      </div>

      <header className="ss-apply-header">
        <span className="ss-eyebrow">{event.name} · {event.subtitle}</span>
        <h1 className="ss-apply-title">{t.apply.status.title}</h1>
      </header>

      <div className="ss-apply-card">
        <span className="ss-status-pill" data-kind={reg.status}>
          {STATUS_LABEL[reg.status]}
        </span>

        <div className="ss-callout">{STATUS_EXPLAIN[reg.status]}</div>

        <dl className="ss-kv">
          <dt>姓名</dt><dd>{reg.name}</dd>
          <dt>邮箱</dt><dd>{reg.email}</dd>
          {reg.city && (<><dt>城市</dt><dd>{reg.city}</dd></>)}
          {reg.build_direction && (<><dt>方向</dt><dd>{reg.build_direction}</dd></>)}
          <dt>提交时间</dt>
          <dd>{new Date(reg.submitted_at).toLocaleString('zh-CN')}</dd>
        </dl>

        {payment && (
          <div style={{ marginTop: 24 }}>
            <div className="ss-eyebrow" style={{ marginBottom: 8 }}>付款</div>
            <dl className="ss-kv">
              <dt>金额</dt>
              <dd>¥{(payment.amount_cents / 100).toFixed(2)} {payment.currency}</dd>
              <dt>状态</dt>
              <dd>{payment.status === 'confirmed' ? '已确认到账' : '待主办方确认'}</dd>
              {payment.confirmed_at && (
                <>
                  <dt>确认时间</dt>
                  <dd>{new Date(payment.confirmed_at).toLocaleString('zh-CN')}</dd>
                </>
              )}
            </dl>
          </div>
        )}

        {['submitted', 'reviewing'].includes(reg.status) && (
          <div style={{ marginTop: 24 }}>
            <Link href="/apply" className="ss-btn ss-btn-ghost">修改申请</Link>
          </div>
        )}
      </div>
    </div>
  )
}
