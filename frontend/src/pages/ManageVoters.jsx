import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import adminService from "../utils/adminService";

const ManageVoters = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getVoters();
        setVoters(data.voters || []);
      } catch (e) {
        setError(e.response?.data?.error || "Failed to load voters");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = voters.filter(
    (v) =>
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-navy-900 mb-1">Manage Voters</h1>
            <p className="text-gray-600">{voters.length} registered voter(s)</p>
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading voters...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-navy-900 text-white">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Full Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Verified</th>
                  <th className="text-left py-3 px-4 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No voters found
                    </td>
                  </tr>
                ) : (
                  filtered.map((v) => (
                    <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{v.full_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{v.email}</td>
                      <td className="py-3 px-4">
                        {v.is_email_verified ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-emerald-100 text-emerald-700">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(v.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageVoters;
