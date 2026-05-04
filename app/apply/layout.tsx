import type { ReactNode } from 'react'
import { SiteChrome } from '../_components/SiteChrome'
import '../forms.css'
import './apply.css'

export default function ApplyLayout({ children }: { children: ReactNode }) {
  return <SiteChrome><div className="ss-apply-shell">{children}</div></SiteChrome>
}
