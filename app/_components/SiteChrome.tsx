import type { ReactNode } from 'react'
import { Nav } from './Nav'
import { Footer } from './Footer'

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  )
}
