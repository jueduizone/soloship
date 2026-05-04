import type { ReactNode } from 'react'
import Link from 'next/link'
import '../forms.css'
import './admin.css'
import { requireOrganizer } from '@/lib/auth/require-organizer'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireOrganizer()
  return (
    <div className="ss-admin-shell">
      <header className="ss-admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/" className="ss-brand" aria-label="SoloShip home">
            <img
              src="/assets/brand/soloship-logo.svg"
              alt="SoloShip"
              width={112}
              height={24}
            />
          </Link>
          <span className="ss-admin-tag">admin</span>
        </div>
        <nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/registrations">报名</Link>
          <Link href="/admin/fellows">同学录</Link>
          <Link href="/admin/resources">资料库</Link>
          <Link href="/admin/events">活动配置</Link>
        </nav>
        <div className="ss-user">{user.email}</div>
      </header>
      <main>{children}</main>
    </div>
  )
}
