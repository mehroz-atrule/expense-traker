import type { ReactNode } from "react";
import { 
  Home, 
  FileText, 
  ClipboardList, 
  CreditCard, 
  Users, 
  Settings, 
  Building2,
  DollarSign 
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

// ✅ Import pages
import UserManagement from "../pages/Admin/UserManagement";
import OfficeManagement from "../pages/Admin/OfficeManagement";
import VendorManagement from "../pages/Admin/VendorManagement";
import CreateExpense from "../pages/Submitter/CreateExpense";
import MyExpenses from "../pages/Submitter/MyExpenses";
import CreatePettycashExpense from "../pages/Submitter/CreatePettycashExpense";
import PettycashExpense from "../pages/Submitter/PettycashExpense";
import SystemSettings from "../pages/Admin/SystemSettings";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import CombinedExpensesScreen from "../pages/Submitter/CombinedExpesnes";

const routesConfig = {
  basePath: "/dashboard",
  routes: [
    {
      path: "",
      element: <AdminDashboard />,
      label: "Dashboard",
      icon: <Home size={18} />,
      tooltip: "Dashboard",
      navbar: {
        title: "Dashboard"
      },
    },
    {
      path: "expenses", // ✅ New combined expenses route
      element: <CombinedExpensesScreen />,
      label: "Expenses",
      icon: <DollarSign size={18} />,
      tooltip: "All Expenses",
      navbar: {
        title: "Expenses"
      },
    },
    {
      path: "vendor",
      element: <MyExpenses />,
      label: "Vendor",
      icon: <Building2 size={18} />,
      tooltip: "Vendor Section",
      navbar: {
        title: "Vendor"
      },
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
      navbar: {
        title: "PettyCash"
      },
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
      navbar: {
        title: "System Settings"
      },
      children: [
        {
          path: "users",
          element: <UserManagement />,
          label: "Users",
          icon: <Users size={18} />,
        },
        {
          path: "offices",
          element: <OfficeManagement />,
          label: "Offices",
          icon: <Building2 size={18} />,
        },
      ],
    },
  ],
};

export default routesConfig;