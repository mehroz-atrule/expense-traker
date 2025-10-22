import type { ReactNode } from "react";
import {
  Home,
  FileText,
  ClipboardList,
  CreditCard,
  Users,
  Settings,
  Building2,
} from "lucide-react";

export interface RouteItem {
  path: string;
  element: ReactNode;
  label?: string;
  icon?: ReactNode;
  tooltip?: string;
  navbar?: {
    title: string;
    actions?: ReactNode[];
  };
  children?: RouteItem[];
}

export type Role = "admin";

export type RoutesConfig = {
  [key in Role]: {
    basePath: string;
    routes: RouteItem[];
  };
};

// ✅ Import pages
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import UserManagement from "../pages/Admin/UserManagement";
import OfficeManagement from "../pages/Admin/OfficeManagement";
import VendorManagement from "../pages/Admin/VendorManagement";
import CreateExpense from "../pages/Submitter/CreateExpense";
import MyExpenses from "../pages/Submitter/MyExpenses";
import PettyCash from "../pages/Submitter/PettyCash";
import CreatePettycashExpense from "../pages/Submitter/CreatePettycashExpense";
import PettycashExpense from "../pages/Submitter/PettycashExpense";
import SystemSettings from "../pages/Admin/SystemSettings";

const routesConfig: RoutesConfig = {
  admin: {
    basePath: "/admin",
    routes: [
      {
        path: "",
        element: <AdminDashboard />,
        label: "Dashboard",
        icon: <Home size={18} />,
        tooltip: "Admin dashboard",
        navbar: { title: "Admin Dashboard" },
      },
      {
        path: "users",
        element: <UserManagement />,
        label: "Users",
        icon: <Users size={18} />,
        tooltip: "Manage users",
        navbar: { title: "User Management" },
      },
      {
        path: "offices",
        element: <OfficeManagement />,
        label: "Offices",
        icon: <Building2 size={18} />,
        tooltip: "Manage offices",
        navbar: { title: "Office Management" },
      },
      {
        path: "vendor",
        element: <MyExpenses />,
        label: "Vendor",
        icon: <Building2 size={18} />,
        tooltip: "Vendor Section",
        navbar: { title: "Vendor" },
        children: [
          {
            path: "create-expense",
            element: <CreateExpense />,
            label: "Create Expense",
            icon: <FileText size={18} />,
          },
          {
            path: "my-expenses",
            element: <MyExpenses />,
            label: "Vendor Expenses",
            icon: <ClipboardList size={18} />,
          },
          {
            path: "manage",
            element: <VendorManagement />,
            label: "Manage Vendors",
            icon: <Building2 size={18} />,
          },
        ],
      },
      {
        path: "pettycash",
        element: <PettycashExpense />,
        label: "PettyCash",
        icon: <CreditCard size={18} />,
        tooltip: "Manage petty cash",
        navbar: { title: "PettyCash" },
        children: [
          {
            path: "create-expense",
            element: <CreatePettycashExpense />,
            label: "Create Pettycash Expense",
            icon: <FileText size={18} />,
          },
          {
            path: "expenses",
            element: <PettycashExpense />,
            label: "Pettycash Expenses",
            icon: <ClipboardList size={18} />,
          },
        ],
      },
      {
        path: "settings",
        element: <SystemSettings />,
        label: "Settings",
        icon: <Settings size={18} />,
        tooltip: "System settings",
        navbar: { title: "System Settings" },
      },
    ],
  },
};

export default routesConfig;
