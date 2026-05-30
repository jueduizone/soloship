import { cookies } from 'next/headers'
import { Nav } from './_components/Nav'
import { Hero } from './_components/Hero'
import { WhyNow } from './_components/WhyNow'
import { WhySoloShip } from './_components/WhySoloShip'
import { WhoItsFor } from './_components/WhoItsFor'
import { Timeline } from './_components/Timeline'
import { Mentors } from './_components/Mentors'
import { Partners } from './_components/Partners'
import { Outcome } from './_components/Outcome'
import { FAQ } from './_components/FAQ'
import { FinalCTA } from './_components/FinalCTA'
import { Footer } from './_components/Footer'
import { getSiteContent } from './_components/content'
import { getCurrentLocale } from '@/lib/i18n/site'

export default function SoloShipPage() {
  const content = getSiteContent(getCurrentLocale(cookies()))

  return (
    <>
      <Nav />
      <Hero content={content} />
      <WhyNow content={content} />
      <WhySoloShip content={content} />
      <WhoItsFor content={content} />
      <Timeline content={content} />
      <Mentors content={content} />
      <Partners content={content} />
      <Outcome content={content} />
      <FAQ content={content} />
      <FinalCTA content={content} />
      <Footer />
    </>
  )
}
