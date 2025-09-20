import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const Home = () => {
  return (
    <section className="flex flex-col md:flex-row justify-between items-center h-[calc(100vh-64px)] px-6 md:px-20 py-10">
     
      <div className="max-w-xl text-center md:text-left">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-gray-900">
          Discover Your{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Perfect Career
          </span>{" "}
          Path
        </h1>

        <p className="text-gray-600 mt-6 text-base md:text-lg">
          Find your perfect career path with our AI-powered advisor. Simply take
          our comprehensive assessment and unlock your professional potential.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center md:justify-start">
          <Link to="/career">
            <Button className="cursor-pointer px-8 py-3 text-lg font-medium shadow-lg rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
              Start Your Journey
            </Button>
          </Link>
          
            
            <Button
              variant="outline"
              className="px-8 py-3 text-lg font-medium rounded-xl border border-gray-400 hover:bg-gray-100 transition-all duration-300"
              >
              Learn More
            </Button>
          
        </div>
      </div>

      <div className="mt-12 md:mt-0 md:w-1/2 flex justify-center">
        <div className="relative w-full max-w-md">
          <img
            src="/first.jpg" 
            alt="Career path"
            className="rounded-2xl shadow-xl object-cover w-full h-auto"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-400/20 to-pink-400/20 blur-3xl -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Home;
