import type { ReactNode } from 'react'
import './auth.css'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="ss-auth-shell">{children}</div>
}
