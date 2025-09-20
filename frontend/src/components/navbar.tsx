
import { auth } from "../config/firebase";
import { useAuth } from "@/AuthContext";
import { Link } from "react-scroll";


const Navbar = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  const handlesingout = async () => {
    try {
      await auth.signOut();
      

    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

   

  return (  
    <nav className="fixed top-0 left-0 w-full z-50 bg-white px-6 py-3 flex flex-col md:flex-row items-center justify-between">
      
      {/* Logo */}
      <div className="shadow-md rounded-3xl px-2 py-1 flex items-center">
        <img src="/prosperia_1.svg" alt="Logo" className="w-20 h-15" />
      </div>

      {/* Navigation Options */}
      <div className=" shadow-md rounded-3xl px-6 py-2 flex justify-center w-full md:w-1/3">
        <ul className="flex flex-col md:flex-row gap-4 md:gap-8 items-center text-gray-700 font-medium">
          <li className="hover:text-indigo-600 cursor-pointer transition">
            <Link to="home" spy={true} smooth={true} offset={-80} duration={500} >Home</Link>
          </li>
          <li className="hover:text-indigo-600 cursor-pointer transition">
            <Link to="aboutUs" spy={true} smooth={true} offset={-70} duration={500} >
            About Us
            </Link>
          </li>
          <li className="hover:text-indigo-600 cursor-pointer transition">
            <Link to="howitworks" spy={true} smooth={true} offset={-70} duration={500} >
            How It Works
            </Link>
          </li>
          <li className="hover:text-indigo-600 cursor-pointer transition">
            <Link to="mapYourPath" spy={true} smooth={true} offset={-70} duration={500} >
            Map Your Path
            </Link>
          
          </li>
        </ul>
      </div>

      {/* Profile / Get Started */}
      <div className=" shadow-md rounded-3xl flex items-center">
        {user ? (
          <><button onClick={handlesingout} className=" px-5 py-2 flex items-center rounded-3xl  text-white shadow-md transition">

            {user.photoURL ? (
                <img
                src={user.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-full mr-2 object-cover border border-gray-300"
                />
            ) : (
                <div className="w-10 h-10 rounded-full mr-2 bg-gray-300 flex items-center justify-center text-white font-semibold">
                {user.displayName?.charAt(0)}
              </div>
            )}
            <span className="text-gray-800 font-medium">{user.displayName}</span>
            </button>
          </>
        ) : (
          <a
            href="/auth"
            className="bg-amber-400 hover:bg-amber-500 text-white px-7 py-2 rounded-3xl shadow-md transition"
          >
            Get Started
          </a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
