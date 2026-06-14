'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LotteryWinnerRow } from '@/lib/db/types'

interface LotteryDrawButtonProps {
  sampleEmails: string[]
  prizes: Array<{ id: string; name: string }>
  idleLabel: string
  pendingLabel: string
  disabled?: boolean
}

export function LotteryDrawButton({
  sampleEmails,
  prizes,
  idleLabel,
  pendingLabel,
  disabled = false,
}: LotteryDrawButtonProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'result' | 'error'>('idle')
  const [stageIndex, setStageIndex] = useState(0)
  const [rollingEmail, setRollingEmail] = useState(sampleEmails[0] ?? 'ready@soloship.club')
  const [winners, setWinners] = useState<LotteryWinnerRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const pool = useMemo(() => sampleEmails.length > 0 ? sampleEmails : ['ready@soloship.club'], [sampleEmails])
  const prizeNameById = useMemo(
    () => new Map(prizes.map(prize => [prize.id, prize.name])),
    [prizes]
  )
  const groupedWinners = useMemo(() => {
    const groups = new Map<string, LotteryWinnerRow[]>()
    for (const winner of winners) {
      const key = winner.prize_id
      groups.set(key, [...(groups.get(key) ?? []), winner])
    }
    return Array.from(groups.entries()).map(([awardId, rows]) => ({
      awardId,
      name: prizeNameById.get(awardId) ?? awardId,
      winners: rows.sort((a, b) => a.position - b.position),
    }))
  }, [prizeNameById, winners])
  const isDrawing = phase === 'drawing'
  const isModalOpen = phase !== 'idle'
  const stages = ['打乱邮箱池', '按奖项顺序分配', '排除已中奖邮箱', '生成开奖结果']

  useEffect(() => {
    if (!isDrawing) return
    const timer = window.setInterval(() => {
      setRollingEmail(pool[Math.floor(Math.random() * pool.length)] ?? pool[0])
    }, 80)
    return () => window.clearInterval(timer)
  }, [isDrawing, pool])

  useEffect(() => {
    if (!isDrawing) return
    setStageIndex(0)
    const timer = window.setInterval(() => {
      setStageIndex(index => Math.min(index + 1, stages.length - 1))
    }, 720)
    return () => window.clearInterval(timer)
  }, [isDrawing, stages.length])

  async function draw() {
    if (disabled || isDrawing) return
    setError(null)
    setWinners([])
    setPhase('drawing')
    const startedAt = Date.now()
    const response = await fetch('/api/lottery/draw', {
      method: 'POST',
    })
    const data = await response.json().catch(() => ({}))
    const elapsed = Date.now() - startedAt
    if (elapsed < 2600) {
      await new Promise(resolve => window.setTimeout(resolve, 2600 - elapsed))
    }
    if (!response.ok) {
      setError(typeof data.error === 'string' ? data.error : '抽奖失败')
      setPhase('error')
      return
    }
    const nextWinners = Array.isArray(data.winners) ? data.winners : []
    setWinners(nextWinners)
    setPhase('result')
    router.refresh()
  }

  function closeModal() {
    if (isDrawing) return
    setPhase('idle')
  }

  return (
    <div className="ss-lottery-draw-control">
      <button
        className="ss-btn-action is-primary"
        type="button"
        disabled={disabled || isDrawing}
        aria-busy={isDrawing}
        onClick={draw}
      >
        {isDrawing ? pendingLabel : idleLabel}
      </button>

      {isModalOpen && (
        <div className="ss-lottery-modal" role="dialog" aria-modal="true" aria-live="polite">
          <div className="ss-lottery-modal-card">
            {isDrawing ? (
              <>
                <div className="ss-lottery-modal-kicker">SoloShip Lottery</div>
                <h2>正在开奖</h2>
                <div className="ss-lottery-rolling-stage">
                  <span className="ss-lottery-spinner" />
                  <strong>{rollingEmail}</strong>
                </div>
                <div className="ss-lottery-stage-list">
                  {stages.map((stage, index) => (
                    <span className={index <= stageIndex ? 'is-active' : ''} key={stage}>
                      {stage}
                    </span>
                  ))}
                </div>
              </>
            ) : phase === 'result' ? (
              <>
                <div className="ss-lottery-modal-kicker">Draw Complete</div>
                <h2>开奖结果</h2>
                {groupedWinners.length === 0 ? (
                  <p className="ss-lottery-modal-note">没有新的中奖名额。</p>
                ) : (
                  <div className="ss-lottery-result-list">
                    {groupedWinners.map(group => (
                      <div className="ss-lottery-result-group" key={group.awardId}>
                        <strong>{group.name}</strong>
                        <div>
                          {group.winners.map(winner => (
                            <span key={winner.id}>{winner.position}. {winner.email}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="ss-btn-action is-primary" type="button" onClick={closeModal}>完成</button>
              </>
            ) : (
              <>
                <div className="ss-lottery-modal-kicker">Draw Paused</div>
                <h2>暂时不能开奖</h2>
                <p className="ss-lottery-modal-note">{error ?? '抽奖失败，请检查设置后重试。'}</p>
                <button className="ss-btn-action" type="button" onClick={closeModal}>关闭</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
