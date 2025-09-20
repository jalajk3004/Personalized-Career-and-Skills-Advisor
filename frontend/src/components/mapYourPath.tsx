import  { useRef } from 'react'

import { Link } from 'react-router-dom';

const MapYourPath = () => {
    const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  const careerPaths = [
    {
      title: "UX/UI Designer",
      description: "Shape user experiences and design intuitive interfaces for digital products.",
    },
    {
      title: "Data Scientist",
      description: "Analyze complex data sets to extract insights and drive business decisions."
    },
    {
      title: "Digital Marketing Specialist",
      description: "Develop and execute online campaigns to grow brand visibility and customer engagement."
    },
    {
      title: "Software Developer",
      description: "Build and maintain software applications for web, mobile, and desktop platforms."
    },
    {
      title: "Financial Analyst",
      description: "Evaluate investment opportunities and provide financial guidance to organizations."
    },
  ];
  return (
    <div>
      
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Map Your Path</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover personalized career recommendations based on your unique profile, complete with detailed roadmaps and actionable next steps.
          </p>
        </header>

        {/* Career Card Section */}
        <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          

          <div className="relative">
            <div ref={carouselRef} className="flex overflow-x-auto gap-6 pb-6 hide-scrollbar">
              {/* Carousel Items */}
              {careerPaths.map((path, i) => (
                <div key={i} className="min-w-[85%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[23%] flex-shrink-0 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-transform hover:scale-105 duration-300">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center text-white mb-4">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-2v6zm0-8h2V7h-2v2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{path.title}</h3>
                  <p className="text-gray-600 text-sm">
                    {path.description}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Scroll Buttons */}
            <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between px-2 sm:px-6">
              <button onClick={scrollLeft} className="p-3 rounded-full bg-white shadow-xl hover:bg-gray-100 transition-colors z-10">
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={scrollRight} className="p-3 rounded-full bg-white shadow-xl hover:bg-gray-100 transition-colors z-10">
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

        {/* Learning Journey Section */}
        <section className="flex flex-col md:flex-row items-start justify-between">
          {/* Left side: Text content */}
          <div className="w-full md:w-1/2 md:pr-12 mb-12 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Personalized Learning Journey</h2>
            <p className="text-lg text-gray-600 mb-8">
              Every career path comes with a step-by-step roadmap tailored to your current skills and target role. Track your progress and stay motivated with clear milestones and achievements.
            </p>
            
            {/* Steps list */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">Skill Assessment</h4>
                  <p className="text-sm text-gray-500">Pinpoint your existing strengths and identify key areas for development.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">Learning Plan</h4>
                  <p className="text-sm text-gray-500">Receive a personalized roadmap of courses and certifications to fill your skill gaps.</p>
                </div>
              </div>
              
            </div>

            {/* Progress bar and button */}
            <div className="mt-12">
              <h4 className="font-semibold text-lg mb-2">Overall Progress</h4>
              <div className="h-4 w-full bg-gray-200 rounded-full">
                <div className="h-full w-2/3 bg-purple-500 rounded-full"></div>
              </div>
              <Link to="/career">
              <button className="mt-8 px-8 py-4 bg-black text-white text-lg font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105">
                Start Your Assessment Now
              </button>
              </Link>
            </div>
          </div>
          
          {/* Right side: Placeholder box */}
          <div className="w-full md:w-1/2 flex-shrink-0">
            <div className="w-full h-96 md:h-[600px] bg-gray-100 rounded-2xl shadow-inner animate-in">
              <img
              src="/fourth.jpg" 
              alt="Career Journey"
              className="rounded-xl shadow-lg object-cover w-full h-full"
            />
            </div>
          </div>
        </section>
      </div>
    </div>
    </div>
  )
}

export default MapYourPath
