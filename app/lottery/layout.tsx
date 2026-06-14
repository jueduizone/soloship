import type { ReactNode } from 'react'
import '../forms.css'
import '../admin/admin.css'

export const dynamic = 'force-dynamic'

export default function LotteryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ss-admin-shell">
      <main>{children}</main>
    </div>
  )
}
