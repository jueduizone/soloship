import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { getLotteryState, getOrCreateLotteryDraw } from '@/lib/db/lottery'
import {
  createLotteryPrizeAction,
  importLotteryParticipantsAction,
  updateLotteryPrizeAction,
} from './_actions'
import { AdminSubmitButton } from '@/app/admin/AdminSubmitButton'
import { LotteryDrawButton } from './LotteryDrawButton'
import type { LotteryPrizeWithWinners } from '@/lib/db/lottery'

export const dynamic = 'force-dynamic'

function PrizeEditForm({ prize }: { prize: LotteryPrizeWithWinners }) {
  return (
    <form action={updateLotteryPrizeAction} className="ss-lottery-prize-form">
      <input type="hidden" name="id" value={prize.id} />
      <div className="ss-field">
        <label htmlFor={`lottery-prize-name-${prize.id}`}>奖项名称</label>
        <input
          id={`lottery-prize-name-${prize.id}`}
          className="ss-input"
          name="name"
          defaultValue={prize.name}
          required
        />
      </div>
      <div className="ss-field">
        <label htmlFor={`lottery-prize-count-${prize.id}`}>中奖人数</label>
        <input
          id={`lottery-prize-count-${prize.id}`}
          className="ss-input"
          name="winner_count"
          type="number"
          min="1"
          defaultValue={prize.winner_count}
          required
        />
      </div>
      <div className="ss-field">
        <label htmlFor={`lottery-prize-order-${prize.id}`}>排序</label>
        <input
          id={`lottery-prize-order-${prize.id}`}
          className="ss-input"
          name="order_index"
          type="number"
          defaultValue={prize.order_index}
        />
      </div>
      <div className="ss-lottery-form-action">
        <AdminSubmitButton idleLabel="保存" pendingLabel="保存中" />
      </div>
    </form>
  )
}

export default async function LotteryPage() {
  const admin = createAdminClient()
  const event = await getDefaultEvent(admin)
  const draw = await getOrCreateLotteryDraw(admin, {
    eventId: event.id,
    title: `${event.name} 抽奖`,
    userId: null,
  })
  const state = await getLotteryState(admin, draw.id)
  const winnerEmailSet = new Set(state.winners.map(winner => winner.email.toLowerCase()))
  const availableEmails = state.participants
    .map(participant => participant.email)
    .filter(email => !winnerEmailSet.has(email.toLowerCase()))
  const sampleEmails = state.participants.slice(0, 80).map(participant => participant.email)

  return (
    <div className="ss-admin-container ss-lottery-page">
      <div className="ss-admin-title">抽奖工具</div>
      <div className="ss-admin-sub">
        导入邮箱后设置奖项名称和中奖人数；同一邮箱在同一场抽奖中只能中奖一次。
      </div>

      <div className="ss-lottery-summary">
        <div>
          <span>邮箱池</span>
          <strong>{state.participants.length}</strong>
        </div>
        <div>
          <span>剩余可抽</span>
          <strong>{availableEmails.length}</strong>
        </div>
        <div>
          <span>奖项</span>
          <strong>{state.prizes.length}</strong>
        </div>
        <div>
          <span>已中奖</span>
          <strong>{state.winners.length}</strong>
        </div>
      </div>

      <div className="ss-lottery-layout">
        <section className="ss-lottery-panel">
          <h2>导入邮箱</h2>
          <p>支持一行一个、逗号或空格分隔。重新导入会替换当前邮箱池，但不会删除已经产生的中奖历史。</p>
          <form action={importLotteryParticipantsAction} className="ss-form-stack">
            <div className="ss-field">
              <label htmlFor="lottery-emails">邮箱列表</label>
              <textarea
                id="lottery-emails"
                className="ss-textarea ss-lottery-email-input"
                name="emails"
                placeholder="name@example.com&#10;builder@example.com"
                defaultValue={state.participants.map(participant => participant.email).join('\n')}
                required
              />
            </div>
            <AdminSubmitButton idleLabel="导入邮箱" pendingLabel="导入中" />
          </form>
        </section>

        <section className="ss-lottery-panel">
          <h2>新增奖项</h2>
          <p>可以添加多个奖项。开奖时会自动排除已经在其他奖项中中奖的邮箱。</p>
          <form action={createLotteryPrizeAction} className="ss-lottery-prize-form">
            <div className="ss-field">
              <label htmlFor="lottery-prize-name-new">奖项名称</label>
              <input
                id="lottery-prize-name-new"
                className="ss-input"
                name="name"
                placeholder="例如：一等奖 / Cursor Token / 周边礼包"
                required
              />
            </div>
            <div className="ss-field">
              <label htmlFor="lottery-prize-count-new">中奖人数</label>
              <input
                id="lottery-prize-count-new"
                className="ss-input"
                name="winner_count"
                type="number"
                min="1"
                defaultValue={1}
                required
              />
            </div>
            <div className="ss-field">
              <label htmlFor="lottery-prize-order-new">排序</label>
              <input
                id="lottery-prize-order-new"
                className="ss-input"
                name="order_index"
                type="number"
                defaultValue={state.prizes.length}
              />
            </div>
            <div className="ss-lottery-form-action">
              <AdminSubmitButton idleLabel="新增奖项" pendingLabel="新增中" />
            </div>
          </form>
        </section>
      </div>

      <section className="ss-lottery-section">
        <div className="ss-admin-section-title">开奖</div>
        {state.prizes.length === 0 ? (
          <div className="ss-empty">暂无奖项。先在上方新增奖项，再开始抽奖。</div>
        ) : (
          <div className="ss-lottery-prize-list">
            {state.prizes.map(prize => {
              const remainingSlots = Math.max(0, prize.winner_count - prize.winners.length)
              const disabled = remainingSlots === 0 || state.participants.length === 0 || availableEmails.length < remainingSlots
              return (
                <article className="ss-lottery-prize-card" key={prize.id}>
                  <div className="ss-lottery-prize-head">
                    <div>
                      <h2>{prize.name}</h2>
                      <p>{prize.winners.length}/{prize.winner_count} 已开奖 · 还需 {remainingSlots} 人</p>
                    </div>
                    <LotteryDrawButton
                      prizeId={prize.id}
                      disabled={disabled}
                      sampleEmails={sampleEmails}
                      idleLabel={remainingSlots === 0 ? '已开奖' : '开始抽奖'}
                      pendingLabel="开奖中"
                    />
                  </div>

                  <PrizeEditForm prize={prize} />

                  {prize.winners.length > 0 && (
                    <div className="ss-lottery-winner-chips">
                      {prize.winners.map(winner => (
                        <span key={winner.id}>{winner.position}. {winner.email}</span>
                      ))}
                    </div>
                  )}
                  {availableEmails.length < remainingSlots && remainingSlots > 0 && (
                    <div className="ss-form-error">剩余可抽邮箱不足，无法完成该奖项。</div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="ss-lottery-section">
        <div className="ss-admin-section-title">历史中奖记录</div>
        {state.winners.length === 0 ? (
          <div className="ss-empty">暂无中奖记录。</div>
        ) : (
          <table className="ss-table ss-lottery-history-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>奖项</th>
                <th>中奖邮箱</th>
                <th>顺位</th>
              </tr>
            </thead>
            <tbody>
              {state.winners.map(winner => {
                const prize = state.prizes.find(item => item.id === winner.prize_id)
                return (
                  <tr key={winner.id}>
                    <td>{new Date(winner.drawn_at).toLocaleString('zh-CN')}</td>
                    <td>{prize?.name ?? winner.prize_id}</td>
                    <td>{winner.email}</td>
                    <td>{winner.position}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
