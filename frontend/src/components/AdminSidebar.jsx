import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="w-64 bg-navy-900 text-white h-screen shadow-lg overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-yellow-500">COSAKU Admin</h1>
      </div>

      <nav className="px-4 space-y-2">
        <Link
          to="/admin/dashboard"
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
