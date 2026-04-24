import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import adminService from "../utils/adminService";
import electionService from "../utils/electionService";

const STATUS_STYLES = {
  draft: "bg-gray-200 text-gray-700",
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-yellow-100 text-yellow-800",
  closed: "bg-red-100 text-red-700",
  published: "bg-blue-100 text-blue-700",
};

const ElectionControl = () => {
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = async () => {
    const el = await electionService.getActive();
    setElection(el);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await refresh();
      } catch (e) {
        setMessage(e.response?.data?.error || "Failed to load election");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const run = async (action, fn, confirmText) => {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setMessage("");
    try {
      await fn(election.id);
      setMessage(`✓ Election ${action} successfully`);
      await refresh();
    } catch (e) {
      setMessage(e.response?.data?.error || `Failed to ${action} election`);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </AdminLayout>
    );
  }

  if (!election) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-gray-500">No election found</div>
      </AdminLayout>
    );
  }

  const status = election.status;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Election Control</h1>
          <p className="text-gray-600">Manage the lifecycle of the active election</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.startsWith("✓")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-navy-900">{election.title}</h2>
              <p className="text-sm text-gray-500 mt-1">ID: {election.id}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold uppercase ${STATUS_STYLES[status] || "bg-gray-200"}`}
            >
              {status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-gray-500">Start Time</p>
              <p className="font-medium">
                {election.start_time
                  ? new Date(election.start_time).toLocaleString()
                  : "Not started"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">End Time</p>
              <p className="font-medium">
                {election.end_time
                  ? new Date(election.end_time).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Results Published</p>
              <p className="font-medium">
                {election.results_published ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-navy-900 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              {(status === "draft" || status === "paused") && (
                <button
                  disabled={busy}
                  onClick={() =>
                    run(
                      "started",
                      adminService.startElection,
                      "Start the election? Voters will be able to cast ballots."
                    )
                  }
                  className="bg-emerald-600 text-white px-5 py-2 rounded font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  Start Election
                </button>
              )}

              {status === "active" && (
                <button
                  disabled={busy}
                  onClick={() =>
                    run(
                      "paused",
                      adminService.pauseElection,
                      "Pause the election? Voters will not be able to cast new votes."
                    )
                  }
                  className="bg-yellow-500 text-navy-900 px-5 py-2 rounded font-semibold hover:bg-yellow-600 disabled:opacity-50"
                >
                  Pause Election
                </button>
              )}

              {(status === "active" || status === "paused") && (
                <button
                  disabled={busy}
                  onClick={() =>
                    run(
                      "closed",
                      adminService.closeElection,
                      "Close the election? This will finalize voting."
                    )
                  }
                  className="bg-red-600 text-white px-5 py-2 rounded font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  Close Election
                </button>
              )}

              {status === "closed" && !election.results_published && (
                <button
                  disabled={busy}
                  onClick={() =>
                    run(
                      "published",
                      adminService.publishResults,
                      "Publish the results? Voters will be able to view the final results."
                    )
                  }
                  className="bg-blue-600 text-white px-5 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  Publish Results
                </button>
              )}

              {status === "published" && (
                <p className="text-gray-500 italic">
                  Election is complete and results are published.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ElectionControl;
