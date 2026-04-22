import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRegistrationById } from '@/lib/db/registrations'
import { listAdmissionDecisions } from '@/lib/db/admission'
import { getLatestPaymentForRegistration } from '@/lib/db/payments'
import { getDefaultEvent } from '@/lib/db/events'
import type { RegistrationStatus } from '@/lib/db/types'
import { AdmissionActions, PaymentActions } from './Actions'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  submitted: '待审核',
  reviewing: '审核中',
  admitted: '已录取',
  waitlisted: '候补',
  rejected: '未录取',
  payment_pending: '待付款',
  paid: '已入营',
  withdrawn: '已退出',
}

const DECISION_LABEL: Record<string, string> = {
  admit: '录取',
  waitlist: '候补',
  reject: '拒绝',
}

export default async function RegistrationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const admin = createAdminClient()
  const reg = await getRegistrationById(admin, params.id)
  if (!reg) notFound()

  const [event, decisions, payment] = await Promise.all([
    getDefaultEvent(admin),
    listAdmissionDecisions(admin, reg.id),
    getLatestPaymentForRegistration(admin, reg.id),
  ])

  return (
    <div className="ss-admin-container">
      <div style={{ marginBottom: 16, fontSize: 13 }}>
        <Link href="/admin/registrations" style={{ color: 'var(--ss-text-dim)' }}>
          ← 返回报名列表
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div>
          <div className="ss-admin-title" style={{ marginBottom: 4 }}>{reg.name}</div>
          <div className="ss-admin-sub" style={{ marginBottom: 0 }}>{reg.email}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className="ss-status-pill" data-kind={reg.status}>
            {STATUS_LABEL[reg.status]}
          </span>
        </div>
      </div>

      <div className="ss-detail-grid">
        <div className="ss-panel">
          <h3>申请信息</h3>
          <dl className="ss-kv">
            <dt>姓名</dt><dd>{reg.name}</dd>
            <dt>邮箱</dt><dd>{reg.email}</dd>
            <dt>城市</dt><dd>{reg.city ?? '—'}</dd>
            <dt>联系方式</dt><dd>{reg.contact ?? '—'}</dd>
            <dt>自我介绍</dt><dd>{reg.bio ?? '—'}</dd>
            <dt>方向</dt><dd>{reg.build_direction ?? '—'}</dd>
            <dt>提交时间</dt>
            <dd>{new Date(reg.submitted_at).toLocaleString('zh-CN')}</dd>
          </dl>

          {reg.project_idea && (
            <div style={{ marginTop: 20 }}>
              <div className="ss-eyebrow" style={{ marginBottom: 8 }}>项目想法</div>
              <div style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                color: 'var(--ss-text-strong)',
              }}>{reg.project_idea}</div>
            </div>
          )}

          {reg.links && reg.links.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="ss-eyebrow" style={{ marginBottom: 8 }}>链接</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {reg.links.map((l, i) => (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--ss-accent-hi)', textDecoration: 'underline' }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reg.reviewer_note && (
            <div style={{ marginTop: 20 }}>
              <div className="ss-eyebrow" style={{ marginBottom: 8 }}>审核备注</div>
              <div className="ss-callout" style={{ marginTop: 0 }}>{reg.reviewer_note}</div>
            </div>
          )}

          {decisions.length > 0 && (
            <div className="ss-timeline">
              <div className="ss-eyebrow" style={{ marginTop: 20 }}>审核历史</div>
              {decisions.map(d => (
                <div key={d.id} className="row">
                  <div>
                    <span className="kind">{DECISION_LABEL[d.decision] ?? d.decision}</span>
                    {d.note && (
                      <div style={{ marginTop: 4, color: 'var(--ss-text)' }}>{d.note}</div>
                    )}
                  </div>
                  <div className="when">
                    {new Date(d.decided_at).toLocaleString('zh-CN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="ss-panel">
            <h3>审核操作</h3>
            <AdmissionActions registrationId={reg.id} status={reg.status} />
          </div>

          <div className="ss-panel">
            <h3>付款操作</h3>
            <PaymentActions
              registrationId={reg.id}
              status={reg.status}
              payment={payment}
              defaultAmountCents={event.price_cents}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
