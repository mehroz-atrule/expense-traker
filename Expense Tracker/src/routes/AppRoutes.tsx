import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import routesConfig, { type Role } from "./routesCongif";
import DashboardLayout from "../components/Layout/dashboardLayout";

const AppRoutes = () => {
  const role: Role = "admin"; // mock (replace with real auth)

  if (!role) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const { basePath, routes } = routesConfig[role];

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path={basePath} element={<DashboardLayout role={role} />}>
        {routes.map((r, index) => {
          if (r.children) {
            return (
              <Route key={index} path={r.path}>
                {/* Index route for the parent path */}
                <Route index element={r.element} />
                {/* Child routes */}
                {r.children.map((child, childIndex) => (
                  <Route key={`${index}-${childIndex}`} path={child.path} element={child.element} />
                ))}
              </Route>
            );
          }
          return <Route key={index} path={r.path} element={r.element} />;
        })}
      </Route>
      <Route path="*" element={<Navigate to={basePath} replace />} />
    </Routes>
  );
};

export default AppRoutes;
