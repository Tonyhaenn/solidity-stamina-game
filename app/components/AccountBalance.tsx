export default function AccountBalance(){
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Account Balance</h3>
            <dl className="mt-5 grid grid-cols-2 gap-5">  
            <div className="px-4 py-5 bg-white rounded-lg overflow-hidden sm:p-6">
              <dd className="mt-1 text-3xl font-semibold text-gray-900">450000</dd>
              <div className="mt-6">
                <a
                  href="#"
                  className="inline-flex px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Withdraw Balance
                </a>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </div> 
  )
}