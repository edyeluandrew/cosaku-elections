import api from "../api/axios.js";

export const voteService = {
  submitVote: async (electionId, positionId, candidateId) => {
    const response = await api.post("/vote/submit", {
      electionId,
      positionId,
      candidateId,
    });
    return response.data;
  },

  getMyVotes: async (electionId) => {
    const params = {};
    if (electionId) params.electionId = electionId;
    
    const response = await api.get("/vote/my-votes", { params });
    return response.data;
  },

  getVotesByPosition: async (electionId, positionId) => {
    const response = await api.get("/vote/by-position", {
      params: { electionId, positionId },
    });
    return response.data;
  },
};

export default voteService;
