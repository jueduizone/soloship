'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties, ReactNode } from 'react'

const baseStyle: CSSProperties = {
  color: 'var(--ss-text-dim)',
  fontSize: 13,
  fontWeight: 450,
  letterSpacing: '-0.005em',
  padding: '6px 4px',
  transition: 'color 160ms ease',
  whiteSpace: 'nowrap',
  lineHeight: 1,
}

const activeStyle: CSSProperties = {
  color: 'var(--ss-accent-hi)',
  fontWeight: 500,
}

function isActivePath(pathname: string, href: string) {
  if (href.includes('#')) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function NavLink({
  href,
  children,
  className = 'ss-site-nav-link',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  const pathname = usePathname()
  const active = isActivePath(pathname, href)

  return (
    <Link
      href={href}
      className={className}
      aria-current={active ? 'page' : undefined}
      style={active ? { ...baseStyle, ...activeStyle } : baseStyle}
    >
      {children}
    </Link>
  )
}
