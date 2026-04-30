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

  addCandidate: async (candidateData, profilePicture) => {
    const formData = new FormData();
    formData.append("electionId", candidateData.electionId);
    formData.append("positionId", candidateData.positionId);
    formData.append("fullName", candidateData.fullName);
    formData.append("program", candidateData.program);
    if (candidateData.slogan) formData.append("slogan", candidateData.slogan);
    if (candidateData.manifesto)
      formData.append("manifesto", candidateData.manifesto);
    if (candidateData.yearOfStudy)
      formData.append("yearOfStudy", candidateData.yearOfStudy);
    if (profilePicture) formData.append("profilePicture", profilePicture);

    const response = await api.post("/candidates", formData);
    return response.data;
  },

  updateCandidate: async (id, candidateData, profilePicture) => {
    const formData = new FormData();
    formData.append("fullName", candidateData.fullName);
    formData.append("program", candidateData.program);
    if (candidateData.slogan) formData.append("slogan", candidateData.slogan);
    if (candidateData.manifesto)
      formData.append("manifesto", candidateData.manifesto);
    if (candidateData.yearOfStudy)
      formData.append("yearOfStudy", candidateData.yearOfStudy);
    if (profilePicture) formData.append("profilePicture", profilePicture);

    const response = await api.patch(`/candidates/${id}`, formData);
    return response.data;
  },

  deleteCandidate: async (id) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },
};

export default candidateService;
