import { Nav } from './_components/Nav'
import { Hero } from './_components/Hero'
import { WhyNow } from './_components/WhyNow'
import { WhySoloShip } from './_components/WhySoloShip'
import { WhoItsFor } from './_components/WhoItsFor'
import { Timeline } from './_components/Timeline'
import { Outcome } from './_components/Outcome'
import { FAQ } from './_components/FAQ'
import { FinalCTA } from './_components/FinalCTA'
import { Footer } from './_components/Footer'

export default function SoloShipPage() {
  return (
    <>
      <Nav />
      <Hero />
      <WhyNow />
      <WhySoloShip />
      <WhoItsFor />
      <Timeline />
      <Outcome />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  )
}
