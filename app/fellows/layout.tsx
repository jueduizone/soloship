import type { ReactNode } from 'react'
import './fellows.css'

export default function FellowsLayout({ children }: { children: ReactNode }) {
  return <div className="ss-fellows-shell">{children}</div>
}
