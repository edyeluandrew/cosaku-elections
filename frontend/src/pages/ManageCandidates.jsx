import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import candidateService from "../utils/candidateService";

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({
    electionId: "",
    positionId: "",
    fullName: "",
    program: "",
    slogan: "",
    manifesto: "",
    yearOfStudy: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await candidateService.addCandidate(formData, profilePicture);
      setMessage("Candidate added successfully!");
      setFormData({
        electionId: "",
        positionId: "",
        fullName: "",
        program: "",
        slogan: "",
        manifesto: "",
        yearOfStudy: "",
      });
      setProfilePicture(null);
      // Reload candidates
      // fetchCandidates();
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Manage Candidates</h1>
          <p className="text-gray-600">Add, edit, or remove candidates from the election</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes("success")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        {/* Add Candidate Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Add New Candidate</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  Election ID *
                </label>
                <input
                  type="text"
                  name="electionId"
                  value={formData.electionId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter election ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  Position ID *
                </label>
                <input
                  type="text"
                  name="positionId"
                  value={formData.positionId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter position ID"
                  required
                />
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

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  Profile Picture
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              disabled={loading}
              className="w-full bg-yellow-500 text-navy-900 py-2 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 transition"
            >
              {loading ? "Adding..." : "Add Candidate"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageCandidates;
