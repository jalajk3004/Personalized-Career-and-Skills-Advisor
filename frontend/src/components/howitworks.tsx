
import { Link } from 'react-router-dom'

const Howitworks = () => {
  return (
    <div className="min-h-screen m-4 bg-white text-gray-800 font-sans p-6 px-6 md:px-20 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">How It Works</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform guides you through a simple 4-step process to discover your ideal career path and create an actionable plan.
          </p>
        </header>

        {/* Content Section */}
        <main className="flex flex-col md:flex-row items-center justify-between">
          {/* Left side: Placeholder box */}
          <div className="relative w-full md:w-1/2 flex-shrink-0 mb-12 md:mb-0">
            <div className="w-full h-80 md:h-[400px] bg-gray-100 rounded-2xl shadow-inner animate-pulse"></div>
          </div>

          {/* Right side: Steps List */}
          <div className="w-full md:w-1/2 md:pl-16 space-y-8">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="w-2 rounded-l-full h-19 bg-gradient-to-b from-purple-500 to-purple-800 shadow-lg"></div>
              <div className="flex-1 bg-white p-6 rounded-r-2xl shadow-xl border-l-2 border-transparent transition-transform transform hover:scale-105">
                <h3 className="text-xl font-semibold">Complete Assessment</h3>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start">
              <div className="w-2 rounded-l-full h-19 bg-gradient-to-b from-purple-500 to-purple-800 shadow-lg"></div>
              <div className="flex-1 bg-white p-6 rounded-r-2xl shadow-xl border-l-2 border-transparent transition-transform transform hover:scale-105">
                <h3 className="text-xl font-semibold">AI Analysis</h3>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start">
              <div className="w-2 rounded-l-full h-19 bg-gradient-to-b from-purple-500 to-purple-800 shadow-lg"></div>
              <div className="flex-1 bg-white p-6 rounded-r-2xl shadow-xl border-l-2 border-transparent transition-transform transform hover:scale-105">
                <h3 className="text-xl font-semibold">Get Your Path</h3>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start">
              <div className="w-2 rounded-l-full h-19 bg-gradient-to-b from-purple-500 to-purple-800 shadow-lg"></div>
              <div className="flex-1 bg-white p-6 rounded-r-2xl shadow-xl border-l-2 border-transparent transition-transform transform hover:scale-105">
                <h3 className="text-xl font-semibold">Take Action</h3>
              </div>
            </div>
          </div>
        </main>

        {/* Call to Action Section */}
        <div className="mt-20 md:mt-32 text-center">
          <div className="bg-gray-100 p-8 md:p-12 rounded-2xl shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              Unlock your professional potential and discover your ideal career path with our AI-powered guidance.
            </p>
            <Link to="/career">
            <button className="px-8 py-4 bg-black text-white text-lg font-semibold rounded-full shadow-2xl transition-transform transform hover:scale-105">
              Begin Your Assessment
            </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Howitworks
