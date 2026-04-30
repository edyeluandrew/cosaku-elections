import api from "../api/axios.js";

export const positionService = {
  createPosition: async (electionId, name, description, displayOrder) => {
    const response = await api.post("/positions", {
      electionId,
      name,
      description,
      displayOrder,
    });
    return response.data.position;
  },

  getPositions: async (electionId) => {
    const response = await api.get(`/positions?electionId=${electionId}`);
    return response.data.positions;
  },

  updatePosition: async (positionId, name, description, displayOrder) => {
    const response = await api.patch(`/positions/${positionId}`, {
      name,
      description,
      displayOrder,
    });
    return response.data.position;
  },

  deletePosition: async (positionId) => {
    const response = await api.delete(`/positions/${positionId}`);
    return response.data;
  },
};

export default positionService;
