export default function Hero() {
  return (
    <main className="mt-8 mx-auto max-w-7xl px-4 sm:mt-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">Play every day.</span>{' '}
              <span className="block text-indigo-600 xl:inline">Win.</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              The easiest game to win. Insert a coin every day for fourteen days. Win a share of the pool. But if you can't -- you lose your daily coin. Only play if you have stamina.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <a
                  href="#"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Insert Coin
                </a>
              </div>
            </div>
          </div>
        </main>
  )
}
