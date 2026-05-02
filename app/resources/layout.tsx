import type { ReactNode } from 'react'
import '../forms.css'
import '../apply/apply.css'
import './resources.css'

export default function ResourcesLayout({ children }: { children: ReactNode }) {
  return <div className="ss-resources-shell">{children}</div>
}
