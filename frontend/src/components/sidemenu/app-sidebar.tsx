import { useAuth } from "@/AuthContext";
import { MoreVertical, ChevronLast, ChevronFirst } from "lucide-react";
import { useContext, createContext, type ReactNode } from "react";
import { useSidebar } from "@/context/SidebarContext";

// define type for context for sidebar items
type SidebarItemContextType = {
  expanded: boolean;
};

// create context with correct type for sidebar items
const SidebarItemContext = createContext<SidebarItemContextType | undefined>(undefined);

// props type for Sidebar
interface SidebarProps {
  children?: ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const { expanded, toggleExpanded } = useSidebar();
  const { user} = useAuth();

  return (
    <aside className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 ${
      expanded ? "w-64" : "w-16"
    }`}>
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        {/* Logo + toggle */}
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src="https://img.logoipsum.com/243.svg"
            className={`overflow-hidden transition-all ${
              expanded ? "w-32" : "w-0"
            }`}
            alt="logo"
          />
          <button
            onClick={toggleExpanded}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        {/* Menu items */}
        <SidebarItemContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarItemContext.Provider>

        {/* Footer user section */}
        <div className="border-t flex p-3">
          <img
            src={user?.photoURL ?? undefined}
            alt="user avatar"
            className="w-10 h-10 rounded-md"
          />
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${
              expanded ? "w-52 ml-3" : "w-0"
            }`}
          >
            <div className="leading-4">
              <h4 className="font-semibold">{user?.displayName}</h4>
              <span className="text-xs text-gray-600">{user?.email}</span>
            </div>
            <MoreVertical size={20} />
          </div>
        </div>
      </nav>
    </aside>
  );
}

// props for SidebarItem
interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
}

export function SidebarItem({ icon, text, active, alert }: SidebarItemProps) {
  const context = useContext(SidebarItemContext);
  if (!context) throw new Error("SidebarItem must be used within Sidebar");
  const { expanded } = context;

  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${
          active
            ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
            : "hover:bg-indigo-50 text-gray-600"
        }
      `}
    >
      {icon}
      <span
  className={`whitespace-nowrap overflow-hidden transition-all ${
    expanded ? "w-52 ml-3" : "w-0"
  }`}
>
  {expanded && text}
</span>


      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-indigo-100 text-indigo-800 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          `}
        >
          {text}
        </div>
      )}
    </li>
  );
}
