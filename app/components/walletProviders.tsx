
import { useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

import { injected, walletlink, walletconnect } from '../utils/connectors';
import { useState, useEffect } from 'react';
import { useInactiveListener, useEagerConnect }  from '../utils/hooks'

const wallets = [
  { name: 'MetaMask', initials: 'MM', href: '#', bgColor: 'bg-pink-600' , connector: injected}
  ,{ name: 'WalletConnect', initials: 'WC', href: '#', bgColor: 'bg-purple-600' , connector: walletconnect}
  ,{ name: 'Coinbase Wallet', initials: 'CB', href: '#', bgColor: 'bg-yellow-500', connector: walletlink }
]

import { classNames } from '../utils/utils'

const hideIfActive = (active) => {
  if(active){
    return 'invisible'
  }
  return 'visible'
}

const showIfActive = (active) => {
  if(active){
    return 'visible'
  }
  return 'hidden'
}

export default function WalletProviders() {
  const { activate, connector } = useWeb3React()

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState()
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  const triedEager = useEagerConnect()
  useInactiveListener(!triedEager || !!activatingConnector)
 
  return (
    <div>
      <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide">Wallets</h2>
      <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6">
        {wallets.map((wallet)=>(
          <WalletButton key={wallet.name} wallet={wallet} />
        ))}
        <AccountInfo /> 
        <LogoutButton />
        
      </ul>
    </div>
  )
}

function AccountInfo(){
  const { account, active } = useWeb3React();
  const accountStr = account || "";
  return (
    <div className={classNames(showIfActive(active))} > 
    <span className="text-lg leading-6 font-medium text-gray-900"> Account: </span>
    <span className="text-md font-medium text-gray-700"> {accountStr.substring(0,6)}...{accountStr.substring(accountStr.length - 4, accountStr.length)} </span>
    </div>
  )
}

function LogoutButton(){
  const { active, deactivate, connector } = useWeb3React();

  const resetWalletConnector = (connector: AbstractConnector) => {
    if (
      connector &&
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    ) {
      connector.walletConnectProvider = undefined
    }
    deactivate();
  }

  return (
    <button onClick={()=>(resetWalletConnector(connector))} 
      className={classNames(showIfActive(active),"w-20 justify-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50")}>
        Logout
    </button>   
  )
}

function WalletButton({wallet}){
  const { connector, active, activate } = useWeb3React();
  
  const visible = ()=>{
    if(!active) {
      return 'visible'
    } else if(active && connector === wallet.connector){
      return 'visible'
    }
    return 'hidden'
  }
  //Check if active and if current connector; hide non-connected connectors
  return (
     <button className={classNames(visible(),"col-span-1 flex shadow-sm rounded-md")} onClick={()=>(activate(wallet.connector))}>   
        <div
        className={classNames(
          wallet.bgColor,
          'flex-shrink-0 border-b border-gray-200 py-4 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md'
        )}>
          {wallet.initials}
        </div>
        <div className="flex-1 px-4 py-4 text-sm flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
          <div className="flex px-4 text-sm truncate">
            <span className="text-gray-900 font-medium hover:text-gray-600">
              {wallet.name}
            </span>
          </div> 
        </div> 
      </button>
  )
  

}

