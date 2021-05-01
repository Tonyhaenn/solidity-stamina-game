import Roundoverview from "./roundOverview"

export default function Hero() {
  return (
    <div className="bg-white overflow-hidden">
      <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24">
        <div className="max-w-xl mx-auto lg:max-w-none lg:mx-0">
          <div>
            <div className="mt-6">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Play every day. Win. 
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                The easiest game to win. Insert a coin every day for fourteen days. Win a share of the pool.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                But if you can't -- you lose your daily coin. Only play if you have stamina.
              </p>
              
            </div>
          </div>
        </div>
        <div className="mt-12 sm:mt-16 lg:mt-0">
          <Roundoverview />
        </div>
      </div>
    </div>
  )
}
