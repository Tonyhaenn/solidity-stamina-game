import { UsersIcon, CashIcon, SparklesIcon } from '@heroicons/react/outline'
import { getContract } from '../utils/hooks'


//TODO: BLARGH. MAKE THIS WORK. REFACTOR INTO OWN HOOK? ethers contract interaction require await...
const contractDetails = async ()=>{
  const contract = getContract();
  let currentRound, currentDayRound, roundPlayerCount;
  if(contract){
    currentRound = await contract.currentRound();
    currentDayRound = await contract.currentDayRound();
    roundPlayerCount = await contract.roundPlayerCount(currentRound, currentDayRound);
  }
  return {currentRound, currentDayRound, roundPlayerCount}
}

const deets = contractDetails()

const stats = [
  { id: 1, name: 'Total Pot size', stat: '71,897', icon: CashIcon, change: '122', changeType: 'increase' },
  { id: 2, name: 'Value of Broken Players', stat: '5,816', icon: SparklesIcon, change: '5.4%', changeType: 'increase' },
  { id: 3, name: 'Number of Players', stat: deets.roundPlayerCount, icon: UsersIcon, change: '3.2%', changeType: 'decrease' },
]

export default function RoundOverview() {
  return (
    <div className="bg-white px-4 mt-6 mb-2 sm:px-6">
      
      <h3 className="text-lg leading-6 font-medium text-gray-900">Current Round</h3>
      
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative bg-white py-6 px-4 sm:py-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}