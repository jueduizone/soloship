'use client'

import { useFormStatus } from 'react-dom'

export function AdminSubmitButton({ idleLabel, pendingLabel }: { idleLabel: string; pendingLabel: string }) {
  const { pending } = useFormStatus()

  return (
    <button className="ss-btn-action is-primary" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? (
        <span className="ss-loading-label"><span className="ss-auth-spinner" />{pendingLabel}</span>
      ) : idleLabel}
    </button>
  )
}
