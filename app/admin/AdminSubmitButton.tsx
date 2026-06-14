'use client'

import { useFormStatus } from 'react-dom'

export function AdminSubmitButton({
  idleLabel,
  pendingLabel,
  className = 'ss-btn-action is-primary',
  title,
}: {
  idleLabel: string
  pendingLabel: string
  className?: string
  title?: string
}) {
  const { pending } = useFormStatus()

  return (
    <button className={className} type="submit" disabled={pending} aria-busy={pending} title={title}>
      {pending ? (
        <span className="ss-loading-label"><span className="ss-auth-spinner" />{pendingLabel}</span>
      ) : idleLabel}
    </button>
  )
}
