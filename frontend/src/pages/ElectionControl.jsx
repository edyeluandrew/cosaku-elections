import React from "react";
import AdminLayout from "../layouts/AdminLayout";

const ElectionControl = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Election Control</h1>
          <p className="text-gray-600">Control election status and timeline</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Election control interface coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ElectionControl;
