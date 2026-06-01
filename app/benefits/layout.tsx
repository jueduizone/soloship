import type { ReactNode } from 'react'
import { SiteChrome } from '../_components/SiteChrome'
import '../forms.css'
import '../apply/apply.css'
import '../resources/resources.css'
import './benefits.css'

export default function BenefitsLayout({ children }: { children: ReactNode }) {
  return <SiteChrome><div className="ss-benefits-shell">{children}</div></SiteChrome>
}
