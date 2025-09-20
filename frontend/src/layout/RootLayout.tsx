import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import OptionSidebar from "@/components/sidemenu/optionSidebar";

const RootLayout = () => {
  const location = useLocation();

  // pages where sidebar should NOT be shown
  const hideSidebarPaths = ["/", "/auth"];

  const shouldShowSidebar = !hideSidebarPaths.includes(location.pathname);
  const isHomePage = location.pathname === "/auth";

  return (
    <div className="min-h-screen flex flex-col">
      {isHomePage && <Navbar />}

      <div className="flex flex-1 overflow-hidden">
        {shouldShowSidebar && (
          <div className="flex-shrink-0 h-screen">
            <OptionSidebar />
          </div>
        )}

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
