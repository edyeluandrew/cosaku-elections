import api from "../api/axios.js";

export const resultsService = {
  getLiveResults: async (electionId) => {
    const response = await api.get("/results/live", {
      params: { electionId },
    });
    return response.data;
  },

  getResultsByPosition: async (positionId, electionId) => {
    const response = await api.get(`/results/position/${positionId}/${electionId}`);
    return response.data;
  },

  getPublishedResults: async (electionId) => {
    const response = await api.get("/results/published", {
      params: { electionId },
    });
    return response.data;
  },
};

export default resultsService;
