import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import adminService from "../utils/adminService";
import candidateService from "../utils/candidateService";
import electionService from "../utils/electionService";

const ManageVotes = () => {
  const [election, setElection] = useState(null);
  const [votes, setVotes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [editLogs, setEditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [newCandidateId, setNewCandidateId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showLogs, setShowLogs] = useState(false);

  const loadAll = async (electionId) => {
    const [v, c, l] = await Promise.all([
      adminService.getVotes(electionId),
      candidateService.getCandidatesByPosition(electionId),
      adminService.getVoteEditLogs(electionId),
    ]);
    setVotes(v.votes || []);
    setPositions(c.positions || []);
    setEditLogs(l.editLogs || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const el = await electionService.getActive();
        setElection(el);
        await loadAll(el.id);
      } catch (e) {
        setMessage(e.response?.data?.error || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const openEdit = (vote) => {
    setEditing(vote);
    setNewCandidateId("");
    setReason("");
  };

  const candidatesForPosition = (positionId) => {
    const p = positions.find((x) => x.id === positionId);
    return p?.candidates || [];
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!newCandidateId || !reason.trim()) {
      setMessage("Please choose a new candidate and provide a reason");
      return;
    }
    setSubmitting(true);
    try {
      await adminService.editVote(editing.id, newCandidateId, reason);
      setMessage("Vote edited successfully");
      setEditing(null);
      await loadAll(election.id);
    } catch (e) {
      setMessage(e.response?.data?.error || "Edit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-gray-500">Loading votes...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-navy-900 mb-1">Manage Votes</h1>
            <p className="text-gray-600">
              {election?.title} — {votes.length} vote(s) cast
            </p>
          </div>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="bg-navy-900 text-white px-4 py-2 rounded hover:bg-navy-800"
          >
            {showLogs ? "Show Votes" : `Show Edit Logs (${editLogs.length})`}
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.toLowerCase().includes("success")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-yellow-50 text-yellow-800 border-yellow-200"
            }`}
          >
            {message}
          </div>
        )}

        {!showLogs ? (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-900 text-white">
                <tr>
                  <th className="text-left py-3 px-4">Voter</th>
                  <th className="text-left py-3 px-4">Position</th>
                  <th className="text-left py-3 px-4">Candidate</th>
                  <th className="text-left py-3 px-4">Cast At</th>
                  <th className="text-left py-3 px-4">Edited</th>
                  <th className="text-left py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {votes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No votes cast yet
                    </td>
                  </tr>
                ) : (
                  votes.map((v) => (
                    <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{v.voter_name}</div>
                        <div className="text-xs text-gray-500">{v.voter_email}</div>
                      </td>
                      <td className="py-3 px-4">{v.position_name}</td>
                      <td className="py-3 px-4">{v.candidate_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(v.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {v.last_edited_by ? (
                          <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                            Edited
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openEdit(v)}
                          className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-900 text-white">
                <tr>
                  <th className="text-left py-3 px-4">When</th>
                  <th className="text-left py-3 px-4">Admin</th>
                  <th className="text-left py-3 px-4">Position</th>
                  <th className="text-left py-3 px-4">Old → New</th>
                  <th className="text-left py-3 px-4">Reason</th>
                </tr>
              </thead>
              <tbody>
                {editLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      No vote edits recorded
                    </td>
                  </tr>
                ) : (
                  editLogs.map((l) => (
                    <tr key={l.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">{l.admin_name}</td>
                      <td className="py-3 px-4">{l.position_name}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="text-red-600">{l.old_candidate_name}</span>
                        {" → "}
                        <span className="text-emerald-600">{l.new_candidate_name}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{l.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-navy-900 mb-4">Edit Vote</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Voter</p>
              <p className="font-medium">{editing.voter_name}</p>
              <p className="text-sm text-gray-600 mt-2">Position</p>
              <p className="font-medium">{editing.position_name}</p>
              <p className="text-sm text-gray-600 mt-2">Current vote</p>
              <p className="font-medium text-red-600">{editing.candidate_name}</p>
            </div>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  New Candidate
                </label>
                <select
                  value={newCandidateId}
                  onChange={(e) => setNewCandidateId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded p-2"
                >
                  <option value="">-- Select candidate --</option>
                  {candidatesForPosition(editing.position_id)
                    .filter((c) => c.id !== editing.candidate_id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Reason (required)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows="3"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Provide a reason for this edit (will be logged)"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-yellow-500 text-navy-900 px-4 py-2 rounded font-semibold hover:bg-yellow-600 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Confirm Edit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageVotes;
