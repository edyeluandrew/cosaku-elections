import React from "react";
import AdminLayout from "../layouts/AdminLayout";

const ManageVotes = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Manage Votes</h1>
          <p className="text-gray-600">Edit votes and view vote history</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Vote management interface coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageVotes;
