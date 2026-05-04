import type { ReactNode } from 'react'
import { SiteChrome } from '../_components/SiteChrome'
import './fellows.css'

export default function FellowsLayout({ children }: { children: ReactNode }) {
  return <SiteChrome><div className="ss-fellows-shell">{children}</div></SiteChrome>
}
