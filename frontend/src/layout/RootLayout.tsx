import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";

import OptionSidebar from "@/components/sidemenu/optionSidebar";

const RootLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      {isHomePage && <Navbar />}

      <div className="flex flex-1 overflow-hidden">
        {!isHomePage && (
          <div className="flex-shrink-0 h-screen">
            <OptionSidebar />
          </div>
        )}

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
