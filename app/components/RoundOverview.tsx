export default function Roundoverview(){
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Current Round Totals</h3>
            <dl className="mt-5 grid grid-cols-2 gap-5">  
            <div className="px-4 py-5 bg-white rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Pot Size</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">450000</dd>
              <div className="mt-6">
                <a
                  href="#"
                  className="inline-flex px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Insert coin
                </a>
              </div>
            </div>
            <div>
              <div className="px-4 py-5 bg-white border-b border-gray-200 rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Value of Broken Plays</dt>
                <dd className="mt-1 text-1xl font-semibold text-gray-900">40000</dd>
              </div>
              <div className="px-4 py-5 bg-white border-b border-gray-200 rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Number of players</dt>
                <dd className="mt-1 text-1xl font-semibold text-gray-900">45000</dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </div> 
  )
}