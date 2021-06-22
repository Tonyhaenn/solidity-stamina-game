import { Web3ReactProvider } from '@web3-react/core'

import {
  injected,
  network,
  walletconnect,
  walletlink
} from '../utils/connectors';

import { ethers } from 'ethers';

//TODO: This might actually need to be something different. RPC Provider? Unclear.
const Web3Provider = ethers.providers.Web3Provider;

//TODO: Unsure if this is really needed...
enum ConnectorNames {
  Injected = 'Injected',
  Network = 'Network',
  WalletConnect = 'WalletConnect',
  WalletLink = 'WalletLink'
}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.Network]: network,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.WalletLink]: walletlink
}


function getLibrary(provider: any) {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

export default function Web3ReactProviderWrap(props){
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      {props.children}
    </Web3ReactProvider>
  )
}