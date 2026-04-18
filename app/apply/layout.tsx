import type { ReactNode } from 'react'
import '../forms.css'
import './apply.css'

export default function ApplyLayout({ children }: { children: ReactNode }) {
  return <div className="ss-apply-shell">{children}</div>
}
