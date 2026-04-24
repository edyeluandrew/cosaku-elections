import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../utils/authService";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  return (
    <nav className="bg-navy-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/admin/dashboard" className="text-2xl font-bold text-yellow-500">
          COSAKU Admin
        </Link>

        <div className="flex items-center gap-6">
          <span className="text-sm">{user?.fullName}</span>
          <button
            onClick={handleLogout}
            className="bg-yellow-500 text-navy-900 px-4 py-2 rounded font-semibold hover:bg-yellow-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
