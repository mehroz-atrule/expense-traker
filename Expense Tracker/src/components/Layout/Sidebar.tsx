import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

type Role = "submitter" | "operations" | "finance" | "admin";

interface SidebarProps {
  role: Role;
}

// Extended menu with icons and tooltips
const menu: Record<Role, { 
  label: string; 
  path: string; 
  icon: string;
  tooltip: string;
}[]> = {
  submitter: [
    { label: "Create Expense", path: "/submitter/create", icon: "📝", tooltip: "Create new expense" },
    { label: "My Expenses", path: "/submitter/my-expenses", icon: "📋", tooltip: "View my expenses" },
  ],
  operations: [
    { label: "Review Expenses", path: "/operations/review", icon: "👀", tooltip: "Review pending expenses" },
  ],
  finance: [
    { label: "Dashboard", path: "/finance/dashboard", icon: "📊", tooltip: "Finance dashboard" },
    { label: "Validate", path: "/finance/validate", icon: "✅", tooltip: "Validate expenses" },
    { label: "Payment", path: "/finance/payment", icon: "💳", tooltip: "Process payments" },
    { label: "Reports", path: "/finance/reports", icon: "📈", tooltip: "View reports" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: "🏠", tooltip: "Admin dashboard" },
    { label: "Users", path: "/admin/users", icon: "👥", tooltip: "Manage users" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️", tooltip: "System settings" },
  ],
};

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setOpen(!open);
  const toggleCollapse = () => setCollapsed(!collapsed);

  const isActiveLink = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-3 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Desktop Toggle Button */}
      <button
        className="hidden md:flex absolute -right-3 top-6 z-40 bg-gray-700 text-white p-1.5 rounded-full shadow-lg hover:bg-gray-600 transition-colors border-2 border-gray-800"
        onClick={toggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "▶" : "◀"}
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-gray-800 text-white h-screen p-4 transition-all duration-300 ease-in-out
          fixed top-0 left-0 z-50 shadow-2xl
          md:static md:z-30 md:shadow-lg
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between mb-8 ${collapsed ? 'flex-col gap-4' : ''}`}>
          <h2 
            className={`font-bold transition-opacity duration-300 ${
              collapsed ? "text-lg opacity-0" : "text-xl opacity-100"
            }`}
          >
            {role}
          </h2>
          
          {/* Close button for mobile */}
          <button
            className="md:hidden bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-2">
            {menu[role].map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`
                    flex items-center p-3 rounded-lg transition-all duration-200 group relative
                    ${isActiveLink(item.path) 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "hover:bg-gray-700 hover:shadow-sm"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                  onClick={() => setOpen(false)}
                  title={collapsed ? item.tooltip : ""}
                >
                  {/* Icon */}
                  <span className={`text-lg ${collapsed ? "" : "mr-3"}`}>
                    {item.icon}
                  </span>
                  
                  {/* Label - hidden when collapsed */}
                  <span 
                    className={`
                      transition-opacity duration-300 font-medium
                      ${collapsed ? "opacity-0 absolute" : "opacity-100"}
                    `}
                  >
                    {item.label}
                  </span>

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse indicator for desktop */}
        {!collapsed && (
          <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-400 opacity-75">
            Click ← to collapse
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;