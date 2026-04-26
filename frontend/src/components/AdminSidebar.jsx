import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = ({ onClose }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="w-64 bg-navy-900 text-white h-screen shadow-lg overflow-y-auto">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-yellow-500">COSAKU Admin</h1>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden text-white hover:text-yellow-500 text-2xl"
        >
          ×
        </button>
      </div>

      <nav className="px-4 space-y-2">\n        <Link
          to="/admin/dashboard"
          onClick={handleLinkClick}
          className={`block px-4 py-2 rounded transition ${
            isActive("/admin/dashboard")
              ? "bg-yellow-500 text-navy-900 font-semibold"
              : "hover:bg-navy-800"
          }`}
        >
          Dashboard
        </Link>

        <Link
          to="/admin/candidates"
          onClick={handleLinkClick}
          className={`block px-4 py-2 rounded transition ${
            isActive("/admin/candidates")
              ? "bg-yellow-500 text-navy-900 font-semibold"
              : "hover:bg-navy-800"
          }`}
        >
          Manage Candidates
        </Link>

        <Link
          to="/admin/voters"
          onClick={handleLinkClick}
          className={`block px-4 py-2 rounded transition ${
            isActive("/admin/voters")
              ? "bg-yellow-500 text-navy-900 font-semibold"
              : "hover:bg-navy-800"
          }`}
        >
          Manage Voters
        </Link>

        <Link
          to="/admin/votes"
          onClick={handleLinkClick}
          className={`block px-4 py-2 rounded transition ${
            isActive("/admin/votes")
              ? "bg-yellow-500 text-navy-900 font-semibold"
              : "hover:bg-navy-800"
          }`}
        >
          Manage Votes
        </Link>

        <Link
          to="/admin/election-control"
          onClick={handleLinkClick}
          className={`block px-4 py-2 rounded transition ${
            isActive("/admin/election-control")
              ? "bg-yellow-500 text-navy-900 font-semibold"
              : "hover:bg-navy-800"
          }`}
        >
          Election Control
        </Link>

        <Link
          to="/admin/live-results"
          onClick={handleLinkClick}
          className={`block px-4 py-2 rounded transition ${
            isActive("/admin/live-results")
              ? "bg-yellow-500 text-navy-900 font-semibold"
              : "hover:bg-navy-800"
          }`}
        >
          Live Results
        </Link>

        <Link
          to="/admin/reports"
          onClick={handleLinkClick}
          className={`block px-4 py-2 rounded transition ${
            isActive("/admin/reports")
              ? "bg-yellow-500 text-navy-900 font-semibold"
              : "hover:bg-navy-800"
          }`}
        >
          Reports
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
