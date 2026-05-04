import type { ReactNode } from 'react'
import { SiteChrome } from '../_components/SiteChrome'
import '../forms.css'
import '../apply/apply.css'

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <SiteChrome><div className="ss-apply-shell">{children}</div></SiteChrome>
}
