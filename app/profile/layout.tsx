import type { ReactNode } from 'react'
import '../forms.css'
import '../apply/apply.css'

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <div className="ss-apply-shell">{children}</div>
}
