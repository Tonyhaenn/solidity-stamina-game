import Head from 'next/head'
import Nav from '../components/Nav'
import Main from '../components/Main'
import Hero from '../components/Hero'
import PriorRounds from '../components/RoundDetail'
import Roundoverview from '../components/RoundOverview'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Stamina</title>
      </Head>
      <Nav />
      <Main>
        <Hero />
        <Roundoverview />
        <PriorRounds />
      </Main>
    </div>
  )
}
