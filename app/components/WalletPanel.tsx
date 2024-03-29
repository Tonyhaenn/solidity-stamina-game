import { Fragment, useState  } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'

import WalletProviders from './walletProviders'
import { useWeb3React } from '@web3-react/core'

import { classNames } from '../utils/utils'
import { getWeb3ErrorMessage } from '../utils/walletUtils'

function WalletError ({
  error = undefined
}) {
  const classes = 'bg-red-200 rounded-md p-2 mt-5 mx-4'
  
  if(error === undefined){
    return (
      <div className={classNames('invisible',classes)}></div>
    )
  }
  return (
    <div className={classNames('visible',classes)}>
      {getWeb3ErrorMessage(error)}
    </div>
  )
}

export default function WalletPanel({
  open = false,
  onClose = () => {}
}) {
  
  const { error } = useWeb3React();

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" static className="fixed inset-0 overflow-hidden" open={open} onClose={onClose}>
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">Connect Wallet</Dialog.Title>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                          onClick={() => onClose()}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex-1 px-4 sm:px-6"> 
                    <div className="inset-0 px-4 sm:px-6">
                      <WalletProviders />
                    </div>
                    <WalletError error={error}/>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
