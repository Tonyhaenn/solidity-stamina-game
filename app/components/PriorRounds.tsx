/* This example requires Tailwind CSS v2.0+ */
const people = [
  {
    name: 'Leonard Krasner',
    handle: 'leonardkrasner',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Floyd Miles',
    handle: 'floydmiles',
    imageUrl:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Emily Selman',
    handle: 'emilyselman',
    imageUrl:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Kristin Watson',
    handle: 'kristinwatson',
    imageUrl:
      'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]
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
]
export default function PriorRounds() {
  return (
    <div className="flex-grow">
      <div className="mt-6">
        <div className="bg-white px-4 pb-5 mb-2 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Claim Round Winnings</h3>
        </div> 
        <ul className="-my-5 divide-y divide-gray-200">
          {rounds.map((round) => (
            <li key={round.roundNum} className="py-4">
              <div className="flex items-center">
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
