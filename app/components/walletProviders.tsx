import { DotsVerticalIcon } from '@heroicons/react/solid'

const wallets = [
  { name: 'MetaMask', initials: 'MM', href: '#', bgColor: 'bg-pink-600' },
  { name: 'WalletConnect', initials: 'WC', href: '#', bgColor: 'bg-purple-600' },
  { name: 'Coinbase Wallet', initials: 'CB', href: '#', bgColor: 'bg-yellow-500' },
  { name: 'Fortmatic', initials: 'F', href: '#', bgColor: 'bg-green-500' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function WalletProviders() {
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
            <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
              <div className="flex-1 px-4 py-4 text-sm truncate">
                <a href={wallet.href} className="text-gray-900 font-medium hover:text-gray-600">
                  {wallet.name}
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}