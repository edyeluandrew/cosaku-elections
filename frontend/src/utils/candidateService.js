import api from "../api/axios.js";

export const candidateService = {
  getCandidates: async (electionId, positionId) => {
    const params = {};
    if (electionId) params.electionId = electionId;
    if (positionId) params.positionId = positionId;
    
    const response = await api.get("/candidates", { params });
    return response.data;
  },

  getCandidatesByPosition: async (electionId) => {
    const response = await api.get("/candidates/by-position", {
      params: { electionId },
    });
    return response.data;
  },

  addCandidate: async (candidateData) => {
    const response = await api.post("/candidates", {
      electionId: candidateData.electionId,
      positionId: candidateData.positionId,
      fullName: candidateData.fullName,
      program: candidateData.program,
      slogan: candidateData.slogan || null,
      manifesto: candidateData.manifesto || null,
      yearOfStudy: candidateData.yearOfStudy || null,
    });
    return response.data;
  },

  updateCandidate: async (id, candidateData) => {
    const response = await api.patch(`/candidates/${id}`, {
      fullName: candidateData.fullName,
      program: candidateData.program,
      slogan: candidateData.slogan || null,
      manifesto: candidateData.manifesto || null,
      yearOfStudy: candidateData.yearOfStudy || null,
    });
    return response.data;
  },

  deleteCandidate: async (id) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },
};

export default candidateService;
