import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getDefaultEvent } from '@/lib/db/events'
import {
  BENEFIT_CLAIM_STATUS_LABEL,
  BENEFIT_CLAIM_STATUSES,
  BENEFIT_STATUS_LABEL,
  BENEFIT_STATUSES,
  BENEFIT_TYPE_LABEL,
  BENEFIT_TYPES,
  listAdminBenefits,
  listBenefitClaims,
} from '@/lib/db/benefits'
import {
  createBenefitAction,
  updateBenefitAction,
  updateBenefitClaimAction,
} from '@/app/admin/_actions'
import { AdminSubmitButton } from '@/app/admin/AdminSubmitButton'
import type { BenefitRow } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

function toDateTimeLocal(value: string | null) {
  if (!value) return ''
  return value.slice(0, 16)
}

function BenefitFields({ benefit }: { benefit?: BenefitRow }) {
  return (
    <>
      <input type="hidden" name="id" value={benefit?.id ?? ''} />
      <div className="ss-field ss-benefit-title-field">
        <label htmlFor={benefit ? `benefit-title-${benefit.id}` : 'benefit-title-new'}>标题</label>
        <input
          id={benefit ? `benefit-title-${benefit.id}` : 'benefit-title-new'}
          className="ss-input"
          name="title"
          defaultValue={benefit?.title ?? ''}
          placeholder="例如：OpenAI API Token 奖励"
          required
        />
      </div>
      <div className="ss-field ss-benefit-provider-field">
        <label htmlFor={benefit ? `provider-${benefit.id}` : 'provider-new'}>提供方</label>
        <input
          id={benefit ? `provider-${benefit.id}` : 'provider-new'}
          className="ss-input"
          name="provider"
          defaultValue={benefit?.provider ?? ''}
          placeholder="赞助商 / 社区"
        />
      </div>
      <div className="ss-field ss-benefit-type-field">
        <label htmlFor={benefit ? `benefit-type-${benefit.id}` : 'benefit-type-new'}>类型</label>
        <select
          id={benefit ? `benefit-type-${benefit.id}` : 'benefit-type-new'}
          className="ss-select"
          name="type"
          defaultValue={benefit?.type ?? 'token_code'}
        >
          {BENEFIT_TYPES.map(type => (
            <option key={type} value={type}>{BENEFIT_TYPE_LABEL[type]}</option>
          ))}
        </select>
      </div>
      <div className="ss-field ss-benefit-status-field">
        <label htmlFor={benefit ? `benefit-status-${benefit.id}` : 'benefit-status-new'}>状态</label>
        <select
          id={benefit ? `benefit-status-${benefit.id}` : 'benefit-status-new'}
          className="ss-select"
          name="status"
          defaultValue={benefit?.status ?? 'active'}
        >
          {BENEFIT_STATUSES.map(status => (
            <option key={status} value={status}>{BENEFIT_STATUS_LABEL[status]}</option>
          ))}
        </select>
      </div>
      <div className="ss-field ss-benefit-description-field">
        <label htmlFor={benefit ? `description-${benefit.id}` : 'description-new'}>前台描述</label>
        <textarea
          id={benefit ? `description-${benefit.id}` : 'description-new'}
          className="ss-textarea"
          name="description"
          defaultValue={benefit?.description ?? ''}
          placeholder="说明福利内容、价值和领取条件。"
        />
      </div>
      <div className="ss-field ss-benefit-instructions-field">
        <label htmlFor={benefit ? `instructions-${benefit.id}` : 'instructions-new'}>领取说明</label>
        <textarea
          id={benefit ? `instructions-${benefit.id}` : 'instructions-new'}
          className="ss-textarea"
          name="claim_instructions"
          defaultValue={benefit?.claim_instructions ?? ''}
          placeholder="例如：点击领取后复制兑换码，在赞助商后台兑换。"
        />
      </div>
      <div className="ss-field ss-benefit-url-field">
        <label htmlFor={benefit ? `redeem-${benefit.id}` : 'redeem-new'}>领取链接</label>
        <input
          id={benefit ? `redeem-${benefit.id}` : 'redeem-new'}
          className="ss-input"
          name="redeem_url"
          defaultValue={benefit?.redeem_url ?? ''}
          placeholder="https://..."
        />
      </div>
      <div className="ss-field ss-benefit-stock-field">
        <label htmlFor={benefit ? `stock-${benefit.id}` : 'stock-new'}>库存</label>
        <input
          id={benefit ? `stock-${benefit.id}` : 'stock-new'}
          className="ss-input"
          name="total_stock"
          type="number"
          min="0"
          defaultValue={benefit?.total_stock ?? ''}
        />
      </div>
      <div className="ss-field ss-benefit-limit-field">
        <label htmlFor={benefit ? `limit-${benefit.id}` : 'limit-new'}>每人限制</label>
        <input
          id={benefit ? `limit-${benefit.id}` : 'limit-new'}
          className="ss-input"
          name="per_user_limit"
          type="number"
          min="1"
          defaultValue={benefit?.per_user_limit ?? 1}
        />
      </div>
      <div className="ss-field ss-benefit-start-field">
        <label htmlFor={benefit ? `starts-${benefit.id}` : 'starts-new'}>开始时间</label>
        <input
          id={benefit ? `starts-${benefit.id}` : 'starts-new'}
          className="ss-input"
          name="starts_at"
          type="datetime-local"
          defaultValue={toDateTimeLocal(benefit?.starts_at ?? null)}
        />
      </div>
      <div className="ss-field ss-benefit-end-field">
        <label htmlFor={benefit ? `ends-${benefit.id}` : 'ends-new'}>结束时间</label>
        <input
          id={benefit ? `ends-${benefit.id}` : 'ends-new'}
          className="ss-input"
          name="ends_at"
          type="datetime-local"
          defaultValue={toDateTimeLocal(benefit?.ends_at ?? null)}
        />
      </div>
      <div className="ss-field ss-benefit-order-field">
        <label htmlFor={benefit ? `benefit-order-${benefit.id}` : 'benefit-order-new'}>排序</label>
        <input
          id={benefit ? `benefit-order-${benefit.id}` : 'benefit-order-new'}
          className="ss-input"
          name="order_index"
          type="number"
          defaultValue={benefit?.order_index ?? 0}
        />
      </div>
      <div className="ss-field ss-benefit-codes-field">
        <label htmlFor={benefit ? `codes-${benefit.id}` : 'codes-new'}>兑换码导入</label>
        <textarea
          id={benefit ? `codes-${benefit.id}` : 'codes-new'}
          className="ss-textarea"
          name="codes"
          placeholder="Token / 兑换码每行一个。保存时会去重追加，不会展示给未领取用户。"
        />
      </div>
    </>
  )
}

export default async function AdminBenefitsPage() {
  await requireAdmin()
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const [benefits, claims] = await Promise.all([
    listAdminBenefits(admin, event.id),
    listBenefitClaims(admin, event.id),
  ])

  return (
    <div className="ss-admin-container">
      <div className="ss-admin-title">福利管理</div>
      <div className="ss-admin-sub">
        {event.name} · 共 {benefits.length} 个福利，{claims.length} 条领取记录。前台 /benefits 仅对已付费入营用户开放。
      </div>

      <details className="ss-resource-create-panel">
        <summary>
          <span>新增福利</span>
          <span>Token、赞助商权益、周边或人工发放</span>
        </summary>
        <form action={createBenefitAction} className="ss-resource-form ss-benefit-admin-form">
          <BenefitFields />
          <div className="ss-resource-actions ss-benefit-actions">
            <AdminSubmitButton idleLabel="新增" pendingLabel="新增中" />
          </div>
        </form>
      </details>

      {benefits.length === 0 ? (
        <div className="ss-empty">暂无福利。可以先新增一个 Token / 兑换码福利，并导入一批兑换码。</div>
      ) : (
        <div className="ss-benefit-management-table">
          <div className="ss-benefit-management-head">
            <span>福利</span>
            <span>类型</span>
            <span>状态</span>
            <span>库存 / 码</span>
            <span>领取</span>
            <span>操作</span>
          </div>
          <div className="ss-resource-management-body">
            {benefits.map(benefit => (
              <details className="ss-resource-management-row" key={benefit.id}>
                <summary className="ss-benefit-row-main">
                  <div className="ss-resource-row-copy">
                    <div className="ss-resource-admin-title">{benefit.title}</div>
                    <div className="ss-resource-row-summary">
                      {[benefit.provider, benefit.description].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <div><span className="ss-chip">{BENEFIT_TYPE_LABEL[benefit.type]}</span></div>
                  <div><span className="ss-chip" data-kind={benefit.status}>{BENEFIT_STATUS_LABEL[benefit.status]}</span></div>
                  <div className="ss-resource-row-stage">
                    {benefit.total_stock ?? '不限'} / {benefit.assigned_code_count}/{benefit.code_count}
                  </div>
                  <div className="ss-resource-row-order">{benefit.claim_count}</div>
                  <div className="ss-resource-row-actions"><span className="ss-table-action">编辑</span></div>
                </summary>
                <div className="ss-resource-row-editor">
                  <form action={updateBenefitAction} className="ss-resource-form ss-resource-edit-form ss-benefit-admin-form">
                    <BenefitFields benefit={benefit} />
                    <div className="ss-resource-actions ss-benefit-actions">
                      <AdminSubmitButton idleLabel="保存" pendingLabel="保存中" />
                    </div>
                  </form>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="ss-admin-section-title">领取记录</div>
      {claims.length === 0 ? (
        <div className="ss-empty">暂无领取记录。</div>
      ) : (
        <table className="ss-table ss-benefit-claims-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>福利</th>
              <th>状态</th>
              <th>领取信息</th>
              <th>处理</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(claim => (
              <tr key={claim.id}>
                <td>
                  <strong>{claim.user_name ?? '未命名'}</strong>
                  <span>{claim.user_email}</span>
                </td>
                <td>
                  <strong>{claim.benefit?.title ?? claim.benefit_id}</strong>
                  <span>{claim.benefit?.provider ?? ''}</span>
                </td>
                <td><span className="ss-status-pill" data-kind={claim.status}>{BENEFIT_CLAIM_STATUS_LABEL[claim.status]}</span></td>
                <td>
                  <pre>{JSON.stringify(claim.claim_payload, null, 2)}</pre>
                  {claim.tracking_info && <span>{claim.tracking_info}</span>}
                </td>
                <td>
                  <form action={updateBenefitClaimAction} className="ss-benefit-claim-admin-form">
                    <input type="hidden" name="id" value={claim.id} />
                    <select className="ss-select" name="status" defaultValue={claim.status}>
                      {BENEFIT_CLAIM_STATUSES.map(status => (
                        <option key={status} value={status}>{BENEFIT_CLAIM_STATUS_LABEL[status]}</option>
                      ))}
                    </select>
                    <input
                      className="ss-input"
                      name="tracking_info"
                      defaultValue={claim.tracking_info ?? ''}
                      placeholder="物流 / 发放备注"
                    />
                    <AdminSubmitButton idleLabel="更新" pendingLabel="更新中" />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
