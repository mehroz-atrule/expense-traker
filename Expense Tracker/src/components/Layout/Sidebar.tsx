import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import routesConfig, { type Role } from "../../routes/routesCongif";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface SidebarProps {
  role: Role;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ role, open, setOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();

  const { basePath, routes } = routesConfig[role];

  const toggleCollapse = () => setCollapsed(!collapsed);
  const toggleGroup = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const isActive = (path: string) => location.pathname === `${basePath}/${path}`;

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`bg-white text-black p-4 transition-all duration-300 ease-in-out
        fixed top-0 left-0 z-50 shadow-2xl rounded-br-lg rounded-tr-lg
        md:static md:z-30 md:shadow-lg h-screen
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Header */}
        <div
          className={`flex items-center mb-8 transition-all ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && <h2 className="font-bold capitalize">{role}</h2>}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex bg-gray-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-600"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Menu */}
        <ul className="space-y-2">
          {routes.map((item) => {
            const fullPath = `${basePath}/${item.path}`;
            const hasChildren = item.children && item.children.length > 0;

            // Only collapse Vendor & PettyCash
            const isCollapsible =
              item.path === "vendor" || item.path === "pettycash";

            return (
              <li key={item.path}>
                <div
                  className={`flex items-center p-2 sm:p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive(item.path) ? "bg-gray-200 text-black" : "hover:bg-gray-100"
                  } ${collapsed ? "justify-center" : ""}`}
                  onClick={() =>
                    isCollapsible ? toggleGroup(item.path) : setOpen(false)
                  }
                >
                  <span
                    className={`text-base sm:text-lg ${
                      collapsed ? "" : "mr-2 sm:mr-3"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <div className="flex-1 flex justify-between items-center">
                      <span className="font-medium sm:text-sm">{item.label}</span>
                      {isCollapsible && (
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            expanded[item.path] ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Dropdown for collapsible groups */}
                {!collapsed &&
                  isCollapsible &&
                  expanded[item.path] &&
                  item.children && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const childPath = `${fullPath}/${child.path}`;
                        return (
                          <li key={childPath}>
                            <Link
                              to={childPath}
                              className={`flex items-center p-2 rounded-md text-sm transition-all duration-200 ${
                                location.pathname === childPath
                                  ? "bg-gray-100 font-medium"
                                  : "hover:bg-gray-50 text-gray-700"
                              }`}
                              onClick={() => setOpen(false)}
                            >
                              <span className="text-xs mr-2">•</span>
                              <span>{child.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
