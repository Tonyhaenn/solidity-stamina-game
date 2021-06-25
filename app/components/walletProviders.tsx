
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
      </ul>
    </div>
  )
}

function WalletButton({wallet}){
  const { connector, active, activate, deactivate } = useWeb3React();

  function walletButtonClick(active, connector) {
    //If we're active, tear it down
    if(active){
      deactivate();
      resetWalletConnector(connector);
      return;
    }
    //Else activate!
    activate(connector)
    return;
  }

  const resetWalletConnector = (connector: AbstractConnector) => {
    if (
      connector &&
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    ) {
      connector.walletConnectProvider = undefined
    }
  }
  
  return (
     <button className="col-span-1 flex shadow-sm rounded-md" onClick={()=>walletButtonClick(active, wallet.connector)}>   
        <div
        className={classNames(
          wallet.bgColor,
          'flex-shrink-0 border-b border-gray-200 py-6 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md'
        )}>
          {wallet.initials}
        </div>
        <div className="flex-1 px-4 py-4 text-sm flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
          <div className="flex flex-col px-4 text-sm truncate">
            <span className="text-gray-900 font-medium hover:text-gray-600">
              {wallet.name}
            </span>
            <span className={classNames("text-gray-400 font-light italic")}>
              Connected
            </span>
          </div> 
        </div> 
      </button>
  )
  

}

