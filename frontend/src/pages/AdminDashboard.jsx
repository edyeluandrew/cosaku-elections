import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import adminService from "../utils/adminService";
import electionService from "../utils/electionService";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [electionId, setElectionId] = useState(null);
  const [newElectionTitle, setNewElectionTitle] = useState("");
  const [creatingElection, setCreatingElection] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const activeElection = await electionService.getActive();
        if (!activeElection?.id) {
          setError("No active election found.");
          return;
        }

        setElectionId(activeElection.id);
        const response = await adminService.getDashboard(activeElection.id);
        setDashboard(response);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setError(error.response?.data?.error || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleCreateNewElection = async (e) => {
    e.preventDefault();
    if (!newElectionTitle.trim()) {
      alert("Please enter an election title");
      return;
    }

    setCreatingElection(true);
    try {
      await adminService.createElection(newElectionTitle);
      setNewElectionTitle("");
      // Refresh dashboard
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create election");
    } finally {
      setCreatingElection(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          {error}
        </div>
      </AdminLayout>
    );
  }

  if (!dashboard) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          Failed to load dashboard data
        </div>
      </AdminLayout>
    );
  }

  const { election, stats } = dashboard;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-navy-900 mb-2">
            {election?.title || "Election Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
              election?.status === 'active' ? 'bg-green-600' :
              election?.status === 'paused' ? 'bg-yellow-600' :
              election?.status === 'closed' ? 'bg-gray-600' :
              election?.status === 'published' ? 'bg-blue-600' :
              'bg-gray-500'
            }`}>
              {election?.status?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total Voters</p>
            <p className="text-4xl font-bold text-navy-900">{stats?.totalVoters || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Votes Cast</p>
            <p className="text-4xl font-bold text-yellow-600">{stats?.totalVotesCast || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Participation Rate</p>
            <p className="text-4xl font-bold text-blue-600">{stats?.participationRate || 0}%</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Positions</p>
            <p className="text-4xl font-bold text-emerald-600">{stats?.totalPositions || 0}</p>
          </div>
        </div>

        {/* Election Controls */}
        {election?.status !== 'published' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Election Controls</h2>
            <div className="flex gap-4 flex-wrap">
              {election?.status === 'draft' && (
                <button
                  onClick={() => adminService.startElection(electionId)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Start Election
                </button>
              )}
              {election?.status === 'active' && (
                <>
                  <button
                    onClick={() => adminService.pauseElection(electionId)}
                    className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700"
                  >
                    Pause Election
                  </button>
                  <button
                    onClick={() => adminService.closeElection(electionId)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
                  >
                    Close Election
                  </button>
                </>
              )}
              {election?.status === 'closed' && (
                <button
                  onClick={() => adminService.publishResults(electionId)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Publish Results
                </button>
              )}
            </div>
          </div>
        )}

        {/* Create New Election Section */}
        {(election?.status === 'closed' || election?.status === 'published') && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow border-2 border-green-200 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-900 mb-2">✓ Election Complete</h2>
              <p className="text-green-700">
                The current election "{election?.title}" has been {election?.status}. 
                {election?.status === 'published' && ' Results are now available to all voters.'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-300">
              <h3 className="text-lg font-bold text-navy-900 mb-4">Create New Election</h3>
              <form onSubmit={handleCreateNewElection} className="flex gap-3 flex-col sm:flex-row">
                <input
                  type="text"
                  placeholder="Enter election title (e.g., COSAKU 2025-2026)"
                  value={newElectionTitle}
                  onChange={(e) => setNewElectionTitle(e.target.value)}
                  disabled={creatingElection}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  disabled={creatingElection || !newElectionTitle.trim()}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {creatingElection ? "Creating..." : "Create Election"}
                </button>
              </form>
              <p className="text-xs text-gray-600 mt-3">
                A new election will be created in draft status. You can then add positions, candidates, and voters before starting it.
              </p>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Management</h3>
            <div className="space-y-2">
              <a href="/admin/candidates" className="block text-yellow-600 hover:underline">
                → Manage Candidates
              </a>
              <a href="/admin/voters" className="block text-yellow-600 hover:underline">
                → Manage Voters
              </a>
              <a href="/admin/votes" className="block text-yellow-600 hover:underline">
                → Manage Votes
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Results & Reports</h3>
            <div className="space-y-2">
              <a href="/admin/live-results" className="block text-yellow-600 hover:underline">
                → Live Results
              </a>
              <a href="/admin/reports" className="block text-yellow-600 hover:underline">
                → Download Reports
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
