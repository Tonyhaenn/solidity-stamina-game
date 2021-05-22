import Head from 'next/head'
import Nav from '../components/Nav'
import Main from '../components/Main'
import Hero from '../components/Hero'
import PriorRounds from '../components/RoundDetail'
import Roundoverview from '../components/RoundOverview'

import { Web3ReactProvider } from '@web3-react/core'

import { ethers } from 'ethers'
const Web3Provider = ethers.providers.Web3Provider;

function getLibrary(provider: any) {
  return new Web3Provider(provider)
}

export default function Home() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
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
    </Web3ReactProvider>
  )
}
