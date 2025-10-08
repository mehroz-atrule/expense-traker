import type { ReactNode } from "react";
import { 
  Home, FileText, ClipboardList, Eye, CheckCircle, 
  CreditCard, BarChart, Users, Settings, Building2,
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
}

export type Role = "submitter" | "operations" | "finance" | "admin";

export type RoutesConfig = {
  [key in Role]: {
    basePath: string;
    routes: RouteItem[];
  };
};

// ✅ Import pages
import CreateExpense from "../pages/Submitter/CreateExpense";
import MyExpenses from "../pages/Submitter/MyExpenses";

import ReviewExpenses from "../pages/Operations/ReviewExpenses";
import ReviewDetail from "../pages/Operations/ReviewDetail";

import ValidateExpense from "../pages/Finance/ValidateExpense";
import PaymentProcessing from "../pages/Finance/PaymentProcessing";
import Reports from "../pages/Finance/Reports";

import UserManagement from "../pages/Admin/UserManagement";
import SystemSettings from "../pages/Admin/SystemSettings";
import OfficeManagement from "../pages/Admin/OfficeManagement";
import VendorManagement from "../pages/Admin/VendorManagement";
import SubmitterDashboard from "../pages/Dashboard/SubmitterDashboard";
import OperatorDashboard from "../pages/Dashboard/OperatorDashboard";
import FinanceDashboard from "../pages/Dashboard/FinanceDashboard";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";

// 🔹 Example action buttons


const routesConfig: RoutesConfig = {
  submitter: {
    basePath: "/submitter",
    routes: [
      { 
        path: "", 
        element: <SubmitterDashboard />, 
        label: "Dashboard", 
        icon: <Home size={18} />, 
        tooltip: "Go to dashboard",
        navbar: { title: "Dashboard" }
      },
      { 
        path: "createexpense", 
        element: <CreateExpense />, 
        label: "Create Expense", 
        icon: <FileText size={18} />, 
        tooltip: "Create new expense",
        navbar: { title: "Create New Expense", actions: [] }
      },
      { 
        path: "my-expenses", 
        element: <MyExpenses />, 
        label: "Expenses", 
        icon: <ClipboardList size={18} />, 
        tooltip: "View expenses",
        navbar: { title: "Submitted Expenses" }
      },
    ],
  },
  operations: {
    basePath: "/operations",
    routes: [
      { 
        path: "", 
        element: <OperatorDashboard />, 
        label: "Dashboard", 
        icon: <Home size={18} />, 
        tooltip: "Go to dashboard",
        navbar: { title: "Operations Dashboard" }
      },
      { 
        path: "review", 
        element: <ReviewExpenses />, 
        label: "Review Expenses", 
        icon: <Eye size={18} />, 
        tooltip: "Review pending expenses",
        navbar: { title: "Review Expenses" }
      },
      { path: "review/:id", element: <ReviewDetail />, navbar: { title: "Expense Review Detail" } },
    ],
  },
  finance: {
    basePath: "/finance",
    routes: [
      { 
        path: "", 
        element: <FinanceDashboard />, 
        label: "Dashboard", 
        icon: <BarChart size={18} />, 
        tooltip: "Finance dashboard",
        navbar: { title: "Finance Dashboard" }
      },
      { 
        path: "validate/:id", 
        element: <ValidateExpense />, 
        label: "Validate", 
        icon: <CheckCircle size={18} />, 
        tooltip: "Validate expenses",
        navbar: { title: "Validate Expense" }
      },
      { 
        path: "payment", 
        element: <PaymentProcessing />, 
        label: "Payment", 
        icon: <CreditCard size={18} />, 
        tooltip: "Process payments",
        navbar: { title: "Payment Processing" }
      },
      { 
        path: "reports", 
        element: <Reports />, 
        label: "Reports", 
        icon: <BarChart size={18} />, 
        tooltip: "View reports",
        navbar: { title: "Financial Reports", actions: [] }
      },
    ],
  },
  admin: {
    basePath: "/admin",
    routes: [
      { 
        path: "", 
        element: <AdminDashboard />, 
        label: "Dashboard", 
        icon: <Home size={18} />, 
        tooltip: "Admin dashboard",
        navbar: { title: "Admin Dashboard" }
      },
      { 
        path: "users", 
        element: <UserManagement />, 
        label: "Users", 
        icon: <Users size={18} />, 
        tooltip: "Manage users",
        navbar: { title: "User Management" }
      },
      {
        path: "createexpense",
        element: <CreateExpense />,
        label: "Create Expense",
        icon: <FileText size={18} />,
        tooltip: "Create expense as admin",
        navbar: { title: "Create New Expense" }
      },
      {
        path: "my-expenses",
        element: <MyExpenses />,
        label: "My Expenses",
        icon: <ClipboardList size={18} />,
        tooltip: "View expenses (admin)",
        navbar: { title: "Submitted Expenses" }
      },
      {
        path: "offices",
        element: <OfficeManagement />,
        label: "Offices",
        icon: <Users size={18} />,
        tooltip: "Manage offices",
        navbar: { title: "Office Management" }
      },
      {
        path: "vendors",
        element: <VendorManagement />,
        label: "Vendors",
        icon: <Building2 size={18} />,
        tooltip: "Manage vendors",
        navbar: { title: "Vendor Management" }
      },
      { 
        path: "settings", 
        element: <SystemSettings />, 
        label: "Settings", 
        icon: <Settings size={18} />, 
        tooltip: "System settings",
        navbar: { title: "System Settings" }
      },
    ],
  },
};

export default routesConfig;
