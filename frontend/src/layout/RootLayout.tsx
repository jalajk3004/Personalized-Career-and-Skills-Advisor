import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Sidebar, { SidebarItem } from "@/components/app-sidebar";
import { Calendar, Home, Inbox } from "lucide-react";

const RootLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      {isHomePage && <Navbar />}

      <div className="flex flex-1 overflow-hidden">
        {!isHomePage && (
          <div className="flex-shrink-0 h-screen">
            <Sidebar>
              <SidebarItem icon={<Home size={20} />} text="Home" active />
              <SidebarItem icon={<Inbox size={20} />} text="Inbox" />
              <SidebarItem icon={<Calendar size={20} />} text="Calendar" alert />
            </Sidebar>
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
