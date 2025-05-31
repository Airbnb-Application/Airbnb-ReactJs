import { ChevronFirst, ChevronLast } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SidebarContext = createContext();

export default function Sidebar({ children, className }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside className={`relative pt-24 h-screen ${className}`}>
      <div
        className="absolute top-1/2 transform -translate-y-1/2 right-0 translate-x-1/2 cursor-pointer"
        onClick={() => setExpanded((curr) => !curr)}
      >
        <div
          className="p-2 flex justify-between items-center
                                    rounded-[50px] border-solid border-2
                                    transition-all bg-white shadow-sm
                                    hover:shadow-md hover:border-indigo-100
                                    hover:bg-gradient-to-tr
                                    from-indigo-200 to-indigo-100
                                    "
        >
          {expanded ? <ChevronFirst /> : <ChevronLast />}
        </div>
      </div>

      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, text, active, alert, route, query }) {
  const { expanded } = useContext(SidebarContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isActive, setIsActive] = useState(location.pathname === route);

  useEffect(() => {
    if (location.pathname === route) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [location.pathname]);

  const handleClick = () => {
    if (route) {
      if (query) {
        route += `?${new URLSearchParams(query).toString()}`;
      }
      navigate(route);
    }
  };

  return (
    <li
      onClick={handleClick}
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${
          isActive
            ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
            : "hover:bg-indigo-50 text-gray-600"
        }
    `}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
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
