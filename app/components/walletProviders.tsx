
import { useWeb3React } from '@web3-react/core';
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
        {wallets.map((wallet) => (
          <li key={wallet.name} className="col-span-1 flex shadow-sm rounded-md">
            <div
              className={classNames(
                wallet.bgColor,
                'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md'
              )}
            >
              {wallet.initials}
            </div>
            <button onClick={()=>{activate(wallet.connector)}} className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
              <div className="flex-1 px-4 py-4 text-sm truncate">
                <span className="text-gray-900 font-medium hover:text-gray-600">
                  {wallet.name}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function WalletButton(wallet){
  const { connector } = useWeb3React();

  /*
  Rough idea. Encapsulate all the state for the button
  1) Default state, not connected. Tapping button initiates connection 
  2) Conncted state. Tapping button disconnects / tears down connection
  */

}