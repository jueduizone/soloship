import type { ReactNode } from 'react'
import { SiteChrome } from '../_components/SiteChrome'
import '../forms.css'
import './auth.css'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <SiteChrome><div className="ss-auth-shell">{children}</div></SiteChrome>
}
