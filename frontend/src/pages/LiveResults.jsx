import React from "react";
import AdminLayout from "../layouts/AdminLayout";

const LiveResults = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Live Results</h1>
          <p className="text-gray-600">Monitor election results in real-time</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Live results dashboard coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LiveResults;
