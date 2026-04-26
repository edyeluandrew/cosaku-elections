import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../utils/authService";

const AdminNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  return (
    <nav className="bg-navy-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-white hover:text-yellow-500 text-2xl"
        >
          ☰
        </button>

        <Link to="/admin/dashboard" className="text-xl sm:text-2xl font-bold text-yellow-500">
          COSAKU Admin
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <span className="text-xs sm:text-sm">{user?.fullName}</span>
          <button
            onClick={handleLogout}
            className="bg-yellow-500 text-navy-900 px-3 sm:px-4 py-1 sm:py-2 rounded font-semibold hover:bg-yellow-600 text-xs sm:text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
