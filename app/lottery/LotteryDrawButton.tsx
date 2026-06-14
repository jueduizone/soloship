'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { LotteryWinnerRow } from '@/lib/db/types'

interface LotteryDrawButtonProps {
  prizeId: string
  disabled: boolean
  sampleEmails: string[]
  idleLabel: string
  pendingLabel: string
}

export function LotteryDrawButton({
  prizeId,
  disabled,
  sampleEmails,
  idleLabel,
  pendingLabel,
}: LotteryDrawButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rollingEmail, setRollingEmail] = useState(sampleEmails[0] ?? 'ready@soloship.club')
  const [winners, setWinners] = useState<LotteryWinnerRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const pool = useMemo(() => sampleEmails.length > 0 ? sampleEmails : ['ready@soloship.club'], [sampleEmails])

  useEffect(() => {
    if (!isPending) return
    const timer = window.setInterval(() => {
      setRollingEmail(pool[Math.floor(Math.random() * pool.length)] ?? pool[0])
    }, 80)
    return () => window.clearInterval(timer)
  }, [isPending, pool])

  function draw() {
    setError(null)
    setWinners([])
    startTransition(async () => {
      const startedAt = Date.now()
      const response = await fetch(`/api/lottery/prizes/${prizeId}/draw`, {
        method: 'POST',
      })
      const data = await response.json().catch(() => ({}))
      const elapsed = Date.now() - startedAt
      if (elapsed < 1600) {
        await new Promise(resolve => window.setTimeout(resolve, 1600 - elapsed))
      }
      if (!response.ok) {
        setError(typeof data.error === 'string' ? data.error : '抽奖失败')
        return
      }
      setWinners(Array.isArray(data.winners) ? data.winners : [])
      router.refresh()
    })
  }

  return (
    <div className="ss-lottery-draw-control">
      <button
        className="ss-btn-action is-primary"
        type="button"
        disabled={disabled || isPending}
        aria-busy={isPending}
        onClick={draw}
      >
        {isPending ? pendingLabel : idleLabel}
      </button>

      {isPending && (
        <div className="ss-lottery-loading" aria-live="polite">
          <span className="ss-lottery-spinner" />
          <span className="ss-lottery-rolling">{rollingEmail}</span>
        </div>
      )}

      {winners.length > 0 && (
        <div className="ss-form-success">
          开奖完成：{winners.map(winner => winner.email).join('、')}
        </div>
      )}
      {error && <div className="ss-form-error">{error}</div>}
    </div>
  )
}
