import { createContext, useContext, useState, type ReactNode } from "react";

// define type for context
type SidebarContextType = {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
};

// create context with correct type
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// props type for Provider
interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => setExpanded((curr) => !curr);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggleExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
}

// custom hook to use sidebar context
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
