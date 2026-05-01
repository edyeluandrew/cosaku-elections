import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import candidateService from "../utils/candidateService";
import electionService from "../utils/electionService";
import positionService from "../utils/positionService";

const ManageCandidates = () => {
  const [election, setElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    electionId: "",
    positionId: "",
    fullName: "",
    program: "",
    slogan: "",
    manifesto: "",
    yearOfStudy: "",
  });

  // Load election and positions on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const activeElection = await electionService.getActive();
        if (activeElection?.id) {
          setElection(activeElection);
          setFormData(prev => ({ ...prev, electionId: activeElection.id }));
          
          // Load positions for this election
          const positionsList = await positionService.getPositions(activeElection.id);
          setPositions(positionsList);

          // Load candidates for this election
          const candidateData = await candidateService.getCandidatesByPosition(activeElection.id);
          const allCandidates = [];
          if (candidateData.positions) {
            candidateData.positions.forEach(position => {
              allCandidates.push(...position.candidates);
            });
          }
          setCandidates(allCandidates);
        }
      } catch (error) {
        setMessage(error.response?.data?.error || "Failed to load election data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openEdit = (candidate) => {
    setEditing(candidate);
    setFormData({
      electionId: election.id,
      positionId: candidate.position_id,
      fullName: candidate.fullName,
      program: candidate.program,
      slogan: candidate.slogan,
      manifesto: candidate.manifesto,
      yearOfStudy: candidate.yearOfStudy,
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setFormData({
      electionId: election?.id || "",
      positionId: "",
      fullName: "",
      program: "",
      slogan: "",
      manifesto: "",
      yearOfStudy: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (!formData.positionId) {
        setMessage("Please select a position");
        setSubmitting(false);
        return;
      }

      if (editing) {
        // Update existing candidate
        await candidateService.updateCandidate(editing.id, formData);
        setMessage("✓ Candidate updated successfully!");
      } else {
        // Add new candidate
        await candidateService.addCandidate(formData);
        setMessage("✓ Candidate added successfully!");
      }

      // Reload candidates
      const candidateData = await candidateService.getCandidatesByPosition(election.id);
      const allCandidates = [];
      if (candidateData.positions) {
        candidateData.positions.forEach(position => {
          allCandidates.push(...position.candidates);
        });
      }
      setCandidates(allCandidates);

      closeEdit();
      setFormData({
        electionId: election?.id || "",
        positionId: "",
        fullName: "",
        program: "",
        slogan: "",
        manifesto: "",
        yearOfStudy: "",
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.details || "Failed to save candidate";
      setMessage(errorMsg);
      console.error("Error details:", error.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) {
      return;
    }

    try {
      setSubmitting(true);
      await candidateService.deleteCandidate(candidateId);
      setMessage("✓ Candidate deleted successfully!");

      // Reload candidates
      const candidateData = await candidateService.getCandidatesByPosition(election.id);
      const allCandidates = [];
      if (candidateData.positions) {
        candidateData.positions.forEach(position => {
          allCandidates.push(...position.candidates);
        });
      }
      setCandidates(allCandidates);
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to delete candidate");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!election) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          No active election found. Please create an election first.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Manage Candidates</h1>
          <p className="text-gray-600">Add candidates for: <strong>{election.title}</strong></p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg border ${
            message.includes("✓") || message.includes("success")
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {message}
          </div>
        )}

        {/* Add/Edit Candidate Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">
            {editing ? "Edit Candidate" : "Add New Candidate"}
          </h2>
          
          {positions.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg mb-6">
              No positions created yet. Please <a href="/admin/positions" className="font-semibold underline">create positions first</a>.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Position *
                  </label>
                  <select
                    name="positionId"
                    value={formData.positionId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  >
                    <option value="">Select a position</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Candidate full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Program
                  </label>
                  <input
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Course/Program"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Year of Study
                  </label>
                  <input
                    type="text"
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g., Year 2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Slogan
                  </label>
                  <input
                    type="text"
                    name="slogan"
                    value={formData.slogan}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Campaign slogan"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Manifesto
                  </label>
                  <textarea
                    name="manifesto"
                    value={formData.manifesto}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-24 resize-none"
                    placeholder="Short manifesto"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-yellow-500 text-navy-900 py-2 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 transition"
              >
                {submitting ? (editing ? "Updating..." : "Adding...") : (editing ? "Update Candidate" : "Add Candidate")}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={closeEdit}
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              )}
            </form>
          )}
        </div>

        {/* Candidates List */}
        {candidates.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-navy-900">Candidates ({candidates.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-900 text-white">
                  <tr>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Course</th>
                    <th className="text-left py-3 px-4">Slogan</th>
                    <th className="text-left py-3 px-4">Position</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{candidate.fullName}</td>
                      <td className="py-3 px-4 text-sm">{candidate.program || "—"}</td>
                      <td className="py-3 px-4 text-sm italic text-gray-600">
                        {candidate.slogan ? `"${candidate.slogan}"` : "—"}
                      </td>
                      <td className="py-3 px-4 text-sm">{candidate.position_name}</td>
                      <td className="py-3 px-4 space-x-2 flex">
                        <button
                          onClick={() => openEdit(candidate)}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(candidate.id)}
                          className="text-red-600 hover:text-red-700 font-semibold text-sm hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageCandidates;
