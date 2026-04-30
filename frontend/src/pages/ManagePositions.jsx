import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import positionService from "../utils/positionService";
import electionService from "../utils/electionService";

const ManagePositions = () => {
  const [positions, setPositions] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayOrder: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activeElection = await electionService.getActive();
        if (!activeElection?.id) {
          setMessage("No active election found");
          setLoading(false);
          return;
        }

        setElection(activeElection);
        const positionsList = await positionService.getPositions(activeElection.id);
        setPositions(positionsList);
      } catch (error) {
        setMessage(error.response?.data?.error || "Failed to load positions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (!formData.name.trim()) {
        setMessage("Position name is required");
        setSubmitting(false);
        return;
      }

      if (editingId) {
        // Update position
        await positionService.updatePosition(
          editingId,
          formData.name,
          formData.description,
          formData.displayOrder ? parseInt(formData.displayOrder) : null
        );
        setMessage("✓ Position updated successfully!");
        setEditingId(null);
      } else {
        // Create new position
        await positionService.createPosition(
          election.id,
          formData.name,
          formData.description,
          formData.displayOrder ? parseInt(formData.displayOrder) : positions.length + 1
        );
        setMessage("✓ Position created successfully!");
      }

      setFormData({ name: "", description: "", displayOrder: "" });

      // Refresh positions
      const updatedPositions = await positionService.getPositions(election.id);
      setPositions(updatedPositions);
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to save position");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (position) => {
    setEditingId(position.id);
    setFormData({
      name: position.name,
      description: position.description || "",
      displayOrder: position.display_order || "",
    });
  };

  const handleDelete = async (positionId) => {
    if (!window.confirm("Are you sure you want to delete this position?")) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await positionService.deletePosition(positionId);
      setMessage("✓ Position deleted successfully!");

      // Refresh positions
      const updatedPositions = await positionService.getPositions(election.id);
      setPositions(updatedPositions);
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to delete position");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", displayOrder: "" });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading positions...</p>
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
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Manage Positions</h1>
          <p className="text-gray-600">Add, edit, or remove positions for the election</p>
          <p className="text-sm text-gray-500 mt-2">Election: <strong>{election.title}</strong></p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.includes("✓") || message.includes("successfully")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Add/Edit Position Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">
            {editingId ? "Edit Position" : "Add New Position"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  Position Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="e.g., President"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="1"
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-20 resize-none"
                  placeholder="Position description (optional)"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-yellow-500 text-navy-900 py-2 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 transition"
              >
                {submitting ? "Saving..." : editingId ? "Update Position" : "Add Position"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Positions List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Positions ({positions.length})</h2>
          {positions.length === 0 ? (
            <p className="text-gray-600">No positions created yet. Add one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-navy-900">Order</th>
                    <th className="text-left py-3 px-4 font-semibold text-navy-900">Position Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-navy-900">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-navy-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={position.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">
                        {position.display_order || "—"}
                      </td>
                      <td className="py-3 px-4 font-medium text-navy-900">{position.name}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {position.description || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleEdit(position)}
                          className="text-blue-600 hover:text-blue-700 font-medium mr-4"
                          disabled={submitting}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(position.id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                          disabled={submitting}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManagePositions;
