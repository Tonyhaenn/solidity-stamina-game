import { CashIcon, SparklesIcon } from '@heroicons/react/outline'
import { CalendarIcon, LocationMarkerIcon, UsersIcon } from '@heroicons/react/solid'

const rounds = [
  {
    roundNum: 1,
    total: 45,
    playerCoin: 40,
    winnings: 5
  },
  {
    roundNum: 2,
    total: 40,
    playerCoin: 35,
    winnings: 5
  },
  {
    roundNum: 3,
    total: 30,
    playerCoin: 25,
    winnings: 5
  }
]
export default function PriorRounds(){
  return (
    <div className="bg-white overflow-hidden sm:rounded-md">
      <div className="bg-white px-4 mt-6 mb-2 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Claim Round Winnings</h3>
        </div> 
      <ul className=""> {/* divide-y divide-gray-200  */}
        {rounds.map((round) => (
          <li key={round.roundNum} className="border-b border-gray-200">
            <a href="#" className="block hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">Round {round.roundNum}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    
                  </div>
                </div>
                <div className="float-right">
                      <a
                        href="#"
                        className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Claim {round.total}
                      </a>
                </div> 
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <CashIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Coin Inserted {round.playerCoin}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      <SparklesIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Winnings {round.winnings}
                    </p>
                  </div>
                </div>
                
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function _PriorRounds() {
  return (
    <div className="flex">
      <div className="mt-6">
        <div className="bg-white px-4 pb-5 mb-2 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Claim Round Winnings</h3>
        </div> 
        <ul className="-my-5 divide-y divide-gray-200">
          {rounds.map((round) => (
            <li key={round.roundNum} className="py-4">
              <div className="flex flex-auto items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center">
                    <p>{round.roundNum}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-min mx-4">
                  <p className="text-sm font-medium text-gray-900 truncate text-center">{round.total}</p>
                  <p className="text-sm text-gray-500 truncate text-center">Total Claim</p>
                </div>
                <div className="flex-1 min-w-min">
                  <span className="text-sm text-gray-900 truncate">=</span>
                </div>
                <div className="flex-1 min-w-min mx-4">
                  <p className="text-sm font-medium text-gray-900 truncate text-center">{round.playerCoin}</p>
                  <p className="text-sm text-gray-500 truncate text-center">Coin Inserted</p>
                </div>
                <div className="flex-1 min-w-min">
                  <p className="text-sm text-gray-900 truncate">+</p>
                </div>
                <div className="flex-1 min-w-min mx-4">
                  <p className="text-sm font-medium text-gray-900 truncate text-center">{round.winnings}</p>
                  <p className="text-sm text-gray-500 truncate text-center">Winnings</p>
                </div>
                <div>
                  <a
                    href="#"
                    className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Claim
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
