'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function LogoutButton({
  label = '退出登录',
  pendingLabel = '退出中',
}: {
  label?: string
  pendingLabel?: string
}) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isPending, startTransition] = useTransition()
  const busy = isLoggingOut || isPending

  return (
    <form
      action="/api/auth/signout"
      method="post"
      onSubmit={(event) => {
        event.preventDefault()
        if (busy) return

        const form = event.currentTarget
        setIsLoggingOut(true)
        startTransition(async () => {
          try {
            const response = await fetch('/api/auth/signout', {
              method: 'POST',
              credentials: 'same-origin',
            })
            if (!response.ok) {
              throw new Error('Sign out failed')
            }
          } catch {
            HTMLFormElement.prototype.submit.call(form)
            return
          }

          router.replace('/')
          router.refresh()
        })
      }}
    >
      <button
        type="submit"
        className="ss-btn ss-btn-ghost"
        style={{ height: 34, padding: '0 14px', fontSize: 12.5 }}
        disabled={busy}
        aria-busy={busy}
      >
        {busy ? pendingLabel : label}
      </button>
    </form>
  )
}
