'use client'

import { MouseEvent, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type NavCtaProps = {
  href: string
  label: string
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}

export function NavCta({ href, label }: NavCtaProps) {
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setHydrated(true)
    router.prefetch(href)
  }, [href, router])

  if (!hydrated) {
    return (
      <button
        type="button"
        className="ss-btn ss-btn-ghost group"
        style={{ height: 34, padding: '0 14px', fontSize: 12.5 }}
        aria-disabled="true"
        aria-busy="true"
        disabled
      >
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: 999,
            background: 'var(--ss-accent-hi)',
            boxShadow: '0 0 0 3px rgba(0,251,135,0.16), 0 0 18px rgba(0,251,135,0.52)',
          }}
        />
        {label}
      </button>
    )
  }

  return (
    <a
      href={href}
      className="ss-btn ss-btn-ghost group"
      style={{ height: 34, padding: '0 14px', fontSize: 12.5 }}
      aria-busy={isPending}
      onClick={(event) => {
        if (isModifiedClick(event)) return
        event.preventDefault()
        startTransition(() => {
          router.push(href)
        })
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: 999,
          background: 'var(--ss-accent-hi)',
          boxShadow: '0 0 0 3px rgba(0,251,135,0.16), 0 0 18px rgba(0,251,135,0.52)',
        }}
      />
      {isPending ? '加载中' : label}
    </a>
  )
}
