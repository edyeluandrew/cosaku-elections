import React from "react";
import AdminLayout from "../layouts/AdminLayout";

const ManageVoters = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Manage Voters</h1>
          <p className="text-gray-600">View and manage registered voters</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Voter management interface coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageVoters;
