import type { ReactNode } from 'react'
import { SiteChrome } from '../_components/SiteChrome'
import '../forms.css'
import '../apply/apply.css'
import './resources.css'

export default function ResourcesLayout({ children }: { children: ReactNode }) {
  return <SiteChrome><div className="ss-resources-shell">{children}</div></SiteChrome>
}
