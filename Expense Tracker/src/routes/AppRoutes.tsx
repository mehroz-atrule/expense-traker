import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import CreateExpense from "../pages/Submitter/CreateExpense";
import MyExpenses from "../pages/Submitter/MyExpenses";
import ExpenseDetail from "../pages/Submitter/ExpenseDetail";
import ReviewExpenses from "../pages/Operations/ReviewExpenses";
import ReviewDetail from "../pages/Operations/ReviewDetail";
import FinanceDashboard from "../pages/Finance/FinanceDashboard";
import ValidateExpense from "../pages/Finance/ValidateExpense";
import PaymentProcessing from "../pages/Finance/PaymentProcessing";
import Reports from "../pages/Finance/Reports";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import UserManagement from "../pages/Admin/UserManagement";
import SystemSettings from "../pages/Admin/SystemSettings";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    {/* Submitter routes */}
    <Route
      path="/submitter/*"
      element={
        <div style={{ display: "flex" }}>
          <Sidebar role="submitter" />
          <Routes>
            <Route path="create" element={<CreateExpense />} />
            <Route path="my-expenses" element={<MyExpenses />} />
            <Route path="expense/:id" element={<ExpenseDetail />} />
          </Routes>
        </div>
      }
    />
    {/* Operations routes */}
    <Route
      path="/operations/*"
      element={
        <div style={{ display: "flex" }}>
          <Sidebar role="operations" />
          <Routes>
            <Route path="review" element={<ReviewExpenses />} />
            <Route path="review/:id" element={<ReviewDetail />} />
          </Routes>
        </div>
      }
    />
    {/* Finance routes */}
    <Route
      path="/finance/*"
      element={
        <div style={{ display: "flex" }}>
          <Sidebar role="finance" />
          <Routes>
            <Route path="dashboard" element={<FinanceDashboard />} />
            <Route path="validate" element={<ValidateExpense />} />
            <Route path="payment" element={<PaymentProcessing />} />
            <Route path="reports" element={<Reports />} />
          </Routes>
        </div>
      }
    />
    {/* Admin routes */}
    <Route
      path="/admin/*"
      element={
        <div style={{ display: "flex" }}>
          <Sidebar role="admin" />
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<SystemSettings />} />
          </Routes>
        </div>
      }
    />
    {/* Default dashboard route */}
    <Route path="/" element={<Dashboard />} />
  </Routes>
);

export default AppRoutes;
