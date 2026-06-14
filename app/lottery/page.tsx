import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultEvent } from '@/lib/db/events'
import { getLotteryState, getOrCreateLotteryDraw } from '@/lib/db/lottery'
import {
  clearLotteryParticipantsAction,
  createLotteryPrizeAction,
  deleteLotteryPrizeAction,
  importLotteryParticipantsAction,
  startNextLotteryRoundAction,
  updateLotteryPrizeAction,
} from './_actions'
import { AdminSubmitButton } from '@/app/admin/AdminSubmitButton'
import { LotteryDrawButton } from './LotteryDrawButton'
import type { LotteryPrizeWithWinners } from '@/lib/db/lottery'

export const dynamic = 'force-dynamic'

function PrizeEditForm({ prize }: { prize: LotteryPrizeWithWinners }) {
  const remainingSlots = Math.max(0, prize.winner_count - prize.winners.length)

  return (
    <article className="ss-lottery-prize-item">
      <div className="ss-lottery-prize-status">
        <strong>{prize.name}</strong>
        <span>{prize.winners.length}/{prize.winner_count} 已开奖 · 还需 {remainingSlots} 人</span>
      </div>
      <form action={updateLotteryPrizeAction} className="ss-lottery-prize-row">
        <input type="hidden" name="id" value={prize.id} />
        <div className="ss-field ss-lottery-prize-name-field">
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
        <div className="ss-lottery-row-actions">
          <AdminSubmitButton idleLabel="保存" pendingLabel="保存中" />
        </div>
      </form>
      <form action={deleteLotteryPrizeAction} className="ss-lottery-delete-form">
        <input type="hidden" name="id" value={prize.id} />
        <button className="ss-btn-action is-danger ss-lottery-small-button" type="submit">删除</button>
      </form>
      {prize.winners.length > 0 && (
        <div className="ss-lottery-winner-chips">
          {prize.winners.map(winner => (
            <span key={winner.id}>{winner.position}. {winner.email}</span>
          ))}
        </div>
      )}
    </article>
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
  const currentRoundIndex = Math.max(1, state.draws.findIndex(item => item.id === state.draw.id) + 1)
  const prizeNameById = new Map(state.allPrizes.map(prize => [prize.id, prize.name]))
  const roundIndexByDrawId = new Map(state.draws.map((item, index) => [item.id, index + 1]))
  const winnerEmailSet = new Set(state.allWinners.map(winner => winner.email.toLowerCase()))
  const availableEmails = state.participants
    .map(participant => participant.email)
    .filter(email => !winnerEmailSet.has(email.toLowerCase()))
  const sampleEmails = state.participants.slice(0, 80).map(participant => participant.email)
  const totalRemainingSlots = state.prizes.reduce(
    (total, prize) => total + Math.max(0, prize.winner_count - prize.winners.length),
    0
  )

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
          <strong>{state.allWinners.length}</strong>
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
          {state.participants.length > 0 && (
            <form action={clearLotteryParticipantsAction} className="ss-lottery-clear-emails-form">
              <button
                className="ss-btn-action ss-lottery-clear-emails-button"
                type="submit"
                title="清空当前邮箱池，保留奖项设置和中奖历史"
              >
                清空邮箱池
              </button>
            </form>
          )}
        </section>

        <section className="ss-lottery-panel ss-lottery-prize-panel">
          <h2>奖项设置</h2>
          <p>当前第 {currentRoundIndex} 轮。开奖时会排除所有历史轮次里已经中过奖的邮箱。</p>
          <form action={createLotteryPrizeAction} className="ss-lottery-prize-form">
            <div className="ss-field">
              <label htmlFor="lottery-prize-name-new">奖项名称</label>
              <input
                id="lottery-prize-name-new"
                className="ss-input"
                name="name"
                placeholder="例如：一等奖 / Token"
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

          <div className="ss-lottery-draw-all">
            <div>
              <span>待抽名额</span>
              <strong>{totalRemainingSlots}</strong>
            </div>
            <div className="ss-lottery-draw-actions">
              <LotteryDrawButton
                sampleEmails={sampleEmails}
                prizes={state.prizes.map(prize => ({ id: prize.id, name: prize.name }))}
                idleLabel={totalRemainingSlots === 0 && state.prizes.length > 0 ? '已开奖' : '开始抽奖'}
                pendingLabel="开奖中"
                disabled={totalRemainingSlots === 0 && state.prizes.length > 0}
              />
              {state.winners.length > 0 && (
                <form action={startNextLotteryRoundAction}>
                  <button
                    className="ss-btn-action ss-lottery-reset-button"
                    type="submit"
                    title="复制当前邮箱池和奖项设置，开启下一轮；历史中奖邮箱仍会被排除"
                  >
                    开启新一轮
                  </button>
                </form>
              )}
            </div>
          </div>

          {state.prizes.length === 0 ? (
            <div className="ss-empty ss-lottery-inline-empty">暂无奖项。先新增奖项，再开始抽奖。</div>
          ) : (
            <div className="ss-lottery-prize-list">
              {state.prizes.map(prize => (
                <PrizeEditForm prize={prize} key={prize.id} />
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="ss-lottery-section">
        <div className="ss-lottery-history-head">
          <div className="ss-admin-section-title">历史中奖记录</div>
        </div>
        {state.allWinners.length === 0 ? (
          <div className="ss-empty">暂无中奖记录。</div>
        ) : (
          <table className="ss-table ss-lottery-history-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>轮次</th>
                <th>奖项</th>
                <th>中奖邮箱</th>
                <th>顺位</th>
              </tr>
            </thead>
            <tbody>
              {state.allWinners.map(winner => {
                return (
                  <tr key={winner.id}>
                    <td>{new Date(winner.drawn_at).toLocaleString('zh-CN')}</td>
                    <td>第 {roundIndexByDrawId.get(winner.draw_id) ?? '-'} 轮</td>
                    <td>{prizeNameById.get(winner.prize_id) ?? winner.prize_id}</td>
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
