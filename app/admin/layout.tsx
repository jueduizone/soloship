import type { ReactNode } from 'react'
import Link from 'next/link'
import '../forms.css'
import './admin.css'
import { requireAdmin } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin()
  return (
    <div className="ss-admin-shell">
      <header className="ss-admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="ss-brand">SoloShip</span>
          <span className="ss-admin-tag">admin</span>
        </div>
        <nav>
          <Link href="/admin/registrations">报名</Link>
        </nav>
        <div className="ss-user">{user.email}</div>
      </header>
      <main>{children}</main>
    </div>
  )
}
