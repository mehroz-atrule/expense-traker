import { Menu, X } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  role: string;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  actions?: React.ReactNode[];
}

const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  title,
  actions = [],
}) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between bg-white shadow px-6 py-3 border-b">
      <button
        className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Title */}
      <div
        className="w-full text-lg pl-3 font-medium text-gray-600 cursor-pointer text-center"
        onClick={() => navigate("/")}
      >
        <span>{title}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {actions.map((action, idx) => (
          <span key={idx}>{action}</span>
        ))}
      </div>

    

      <div className="flex items-center gap-4">
        <span className="sm:inline bg-gray-900 h-8 w-8 rounded-full text-white text-center text-sm/7 font-medium">
          ZK
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
