import api from "../api/axios.js";

export const electionService = {
  getActive: async () => {
    const response = await api.get("/elections/active");
    return response.data.election;
  },

  list: async () => {
    const response = await api.get("/elections");
    return response.data.elections;
  },
};

export default electionService;
