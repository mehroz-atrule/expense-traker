import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import routesConfig, { type Role } from "../../routes/routesCongif";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  role: Role;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ role, open, setOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const { basePath, routes } = routesConfig[role];

  const toggleCollapse = () => setCollapsed(!collapsed);

  const isActiveLink = (path: string) => {
    const fullPath = path ? `${basePath}/${path}` : basePath;
    return location.pathname === fullPath;
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

    <aside
  className={`
    bg-white text-black p-4 transition-all duration-300 ease-in-out
    fixed top-0 left-0 z-50 shadow-2xl
    rounded-br-lg rounded-tr-lg
    md:static md:z-30 md:shadow-lg
    h-screen md:h-auto
    ${open ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    ${collapsed ? "w-20" : "w-64"}
  `}
>
        <div
          className={`flex items-center mb-8 transition-all duration-300 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <h2 className="font-bold capitalize transition-opacity duration-300">
              {role}
            </h2>
          )}

          <button
            onClick={toggleCollapse}
            className="hidden md:flex bg-gray-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-600 transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav>
          <ul className="space-y-2">
            {routes
              .filter((r) => r.label)
              .map((item) => {
                const fullPath = item.path ? `${basePath}/${item.path}` : basePath;
                return (
                  <li key={fullPath}>
                    <Link
                      to={fullPath}
                      className={`
                        flex items-center 
                        p-2 sm:p-3
                        rounded-lg transition-all duration-200 group relative
                        text-sm sm:text-base
                        ${
                          isActiveLink(item.path)
                            ? "bg-gray-200 text-black"
                            : "hover:bg-gray-100"
                        }
                        ${collapsed ? "justify-center" : ""}
                      `}
                      onClick={() => setOpen(false)}
                      title={collapsed ? item.label : ""}
                    >
                      <span
                        className={`text-base sm:text-lg ${
                          collapsed ? "" : "mr-2 sm:mr-3"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className="font-medium sm:text-sm">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
