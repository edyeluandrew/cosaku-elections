import api from "../api/axios.js";

export const adminService = {
  getDashboard: async (electionId) => {
    const response = await api.get("/admin/dashboard", {
      params: { electionId },
    });
    return response.data;
  },

  createElection: async (title) => {
    const response = await api.post("/admin/elections", { title });
    return response.data.election;
  },

  getVoters: async () => {
    const response = await api.get("/admin/voters");
    return response.data;
  },

  getVotes: async (electionId, positionId) => {
    const params = {};
    if (electionId) params.electionId = electionId;
    if (positionId) params.positionId = positionId;
    
    const response = await api.get("/admin/votes", { params });
    return response.data;
  },

  editVote: async (voteId, newCandidateId, reason) => {
    const response = await api.patch(`/admin/votes/${voteId}`, {
      newCandidateId,
      reason,
    });
    return response.data;
  },

  getVoteEditLogs: async (electionId) => {
    const params = {};
    if (electionId) params.electionId = electionId;
    
    const response = await api.get("/admin/vote-edit-logs", { params });
    return response.data;
  },

  startElection: async (electionId) => {
    const response = await api.patch(`/admin/elections/${electionId}/start`);
    return response.data;
  },

  pauseElection: async (electionId) => {
    const response = await api.patch(`/admin/elections/${electionId}/pause`);
    return response.data;
  },

  closeElection: async (electionId) => {
    const response = await api.patch(`/admin/elections/${electionId}/close`);
    return response.data;
  },

  publishResults: async (electionId) => {
    const response = await api.patch(`/admin/elections/${electionId}/publish`);
    return response.data;
  },
};

export default adminService;
