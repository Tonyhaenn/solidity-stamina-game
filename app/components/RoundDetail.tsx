import { CashIcon, SparklesIcon } from '@heroicons/react/outline'

const rounds = [
  {
    roundNum: 3,
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
    roundNum: 1,
    total: 30,
    playerCoin: 25,
    winnings: 5
  }
]
export default function RoundDetail(){
  return (
    <div className="bg-white overflow-hidden sm:rounded-md px-4 mt-6 mb-2 sm:px-6">
      <div className="bg-white ">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Claim Round Winnings</h3>
        </div> 
      <ul>
          <li key="allRounds" className="border-b border-gray-200">
            <div className="py-4">
              <div className="flex items-center">
                <p className="text-sm font-medium text-indigo-600 truncate">All Rounds</p>
              </div>
              <div className="float-right">
                <a
                  href="#"
                  className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Withdraw
                </a>
              </div> 
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    <CashIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Total Account Balance 45
                  </p>
                </div>
              </div>
            </div>
          </li>
        {rounds.map((round) => (
          <li key={round.roundNum} className="border-b border-gray-200">
            <div className="py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-600 truncate">Round {round.roundNum}</p>
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
          </li>
        ))}
      </ul>
    </div>
  )
}