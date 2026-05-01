import axios from "axios";

// Determine API URL based on environment
let API_URL;

if (import.meta.env.VITE_API_URL) {
  // Use explicit environment variable if set
  API_URL = import.meta.env.VITE_API_URL;
} else if (import.meta.env.DEV) {
  // Development mode: use localhost
  API_URL = "http://localhost:5000/api";
} else {
  // Production mode: use Render backend
  API_URL = "https://cosaku-elections.onrender.com/api";
}

console.log("🔌 API Configuration:");
console.log("   VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("   Environment:", import.meta.env.DEV ? "development" : "production");
console.log("   Using API_URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData - let browser set it with boundary
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
