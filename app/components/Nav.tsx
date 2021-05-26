import { Fragment, useState, useEffect } from 'react'
import { Disclosure } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import WalletPanel from './WalletPanel'

import { useWeb3React } from '@web3-react/core'
import { useEagerConnect, useInactiveListener } from '../utils/hooks';

const navigation = [{url: "/FAQ",text: "FAQ"}]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const [walletPanel, toggleWalletPanel] = useState(false);
  const { active, connector } = useWeb3React()
  //const web3 = useWeb3React();
  const [activatingConnector, setActivatingConnector] = useState()

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  const triedEager = useEagerConnect()
  useInactiveListener(!triedEager || !!activatingConnector)

  const walletStatusColor = function(status: boolean){
    if(status){
      return 'bg-green-500'
    }
    return 'bg-red-500'
  }

  return (
    <div>
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <Link href="/">
                    <h2 className="pl-4 text-white flex-grow font-bold leading-7 sm:text-3xl sm:truncate">Stamina</h2>
                  </Link>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation.map((item, itemIdx) =>
                        itemIdx === 0 ? (
                          <Fragment key={item.text}>
                            <Link href={item.url}>
                              <a className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium">
                                {item.text}
                              </a>
                            </Link>
                          </Fragment>
                        ) : (
                          <Link href={item.url}>
                          <a
                            key={item.text}
                            
                            className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                          >
                            {item.text}
                          </a>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    <button onClick={()=>toggleWalletPanel(true)} className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <div className="items-center">
                        <span className={classNames('h-2 w-2 rounded-full flex items-center justify-center ring-1 ring-white',walletStatusColor(active))}></span>
                        <span className="">Connect Wallet</span> 
                      </div>
                    </button> 
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                    </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map((item, itemIdx) =>
                  itemIdx === 0 ? (
                    <Fragment key={item.text}>
                      <Link href={item.url}>
                      <a  className="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium">
                        {item.text}
                      </a>
                      </Link>
                    </Fragment>
                  ) : (
                    <Link href={item.url}>
                      <a
                        key={item.text}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                      >
                        {item.text}
                      </a>
                    </Link>
                  )
                )}
              </div>
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div onClick={()=>toggleWalletPanel(true)} className="mt-3 px-2 space-y-1">
                  <span className={classNames('h-2 w-2 rounded-full flex items-center justify-center ring-1 ring-white',walletStatusColor(active))}></span>
                  <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                    Connect Wallet 

                  </a>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <WalletPanel
        open={walletPanel}
        onClose={()=>toggleWalletPanel(false)}
      />
    </div>
  )
}

