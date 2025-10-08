import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import type { Role } from "../../routes/routesCongif";
import { useState } from "react";
import routesConfig from "../../routes/routesCongif";

interface DashboardLayoutProps {
  role: Role;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const { basePath, routes } = routesConfig[role];

  // find current route
  const currentRoute = routes.find((r) => {
    const fullPath = r.path ? `${basePath}/${r.path}` : basePath;
    return location.pathname === fullPath;
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar role={role} open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <div className="sticky top-0 z-50 bg-white shadow">
          <Navbar
            role={role}
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
            title={currentRoute?.navbar?.title || "Expense Manager"}
            actions={currentRoute?.navbar?.actions || []}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
