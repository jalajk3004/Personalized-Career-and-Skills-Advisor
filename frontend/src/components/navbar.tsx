
import { auth } from "@/config/firebase";
import { useAuth } from "@/AuthContext";


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
    <nav className="w-full flex flex-col md:flex-row items-center justify-between px-6 mt-6 gap-4 md:gap-0">
      
      {/* Logo */}
      <div className="bg-white shadow-md rounded-3xl px-5 py-2 flex items-center">
        <span className="text-xl font-bold text-gray-800 mr-2">🌟</span>
        <span className="text-gray-800 font-semibold text-lg">Logo</span>
      </div>

      {/* Navigation Options */}
      <div className="bg-white shadow-md rounded-3xl px-6 py-2 flex justify-center w-full md:w-1/3">
        <ul className="flex flex-col md:flex-row gap-4 md:gap-8 items-center text-gray-700 font-medium">
          <li className="hover:text-indigo-600 cursor-pointer transition">Home</li>
          <li className="hover:text-indigo-600 cursor-pointer transition">About</li>
          <li className="hover:text-indigo-600 cursor-pointer transition">Contact</li>
        </ul>
      </div>

      {/* Profile / Get Started */}
      <div className="bg-white shadow-md rounded-3xl flex items-center">
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
