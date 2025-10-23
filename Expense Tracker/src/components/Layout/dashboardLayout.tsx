import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import routesConfig from "../../routes/routesCongif";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { basePath, routes } = routesConfig;

  // Scroll to top on route change
  useEffect(() => {
    // Scroll the main content area to top
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }

    // Also scroll window to top for safety
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Find current route
  const currentRoute = routes.find((r) => {
    const fullPath = r.path ? `${basePath}/${r.path}` : basePath;
    return location.pathname === fullPath;
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <div className="sticky top-0 z-50 bg-white shadow">
          <Navbar
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
            title={currentRoute?.navbar?.title || "Expense Manager"}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;