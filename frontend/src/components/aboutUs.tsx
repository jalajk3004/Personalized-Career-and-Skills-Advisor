
const AboutUs = () => {
  return (
    <section className="h-[calc(100vh-64px)] w-full bg-gradient-to-b from-white to-gray-50 px-6 md:px-20 py-8 flex flex-col mt-10 justify-between">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900">
          About{" "}
          <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            CareerGuide AI
          </span>
        </h1>
        <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Find your true calling with a blend of AI and human expertise. We’re
          revolutionizing career guidance to help you discover your ideal
          professional path.
        </p>
      </div>

      {/* Story Section */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 flex-1 m-20">
        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
            Empowering Your Career Through Technology
          </h3>
          <p className="mt-2 text-gray-600 text-sm md:text-base">
            CareerGuide AI was born from a simple belief: everyone deserves a
            career that fulfills them. This is a platform that goes beyond your
            skills to understand your passions, values, and life goals.
          </p>
          <p className="mt-2 text-gray-600 text-sm md:text-base">
            We’re here to help you navigate your professional journey, whether
            you’re a student exploring options or a professional seeking a
            meaningful change.
          </p>
        </div>
        {/* Image Placeholder */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-56 h-48 md:w-64 md:h-64">
            <img
              src="/about-us.png" // replace with your image
              alt="Career Journey"
              className="rounded-xl shadow-lg object-cover w-full h-full"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-purple-400/20 to-pink-400/20 blur-2xl -z-10"></div>
          </div>
        </div>
      </div>

      
    </section>
  );
};

export default AboutUs;
