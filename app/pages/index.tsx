import Head from 'next/head'
import Nav from '../components/nav'
import Main from '../components/main'
import Hero from '../components/hero'

export default function Home() {
  return (
    <div>
      
      <Nav />
      <Main>
        <Hero />
      </Main>
    </div>
  )
}
