import api from "../api/axios.js";

export const authService = {
  register: async (fullName, email, password, confirmPassword) => {
    const response = await api.post("/auth/register", {
      fullName,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    const { token: jwtToken, user } = response.data;
    
    // Save token and user to localStorage if provided (auto-login after verification)
    if (jwtToken) {
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    try {
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  },
};

export default authService;
