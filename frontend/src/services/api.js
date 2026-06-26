import axios from "axios";

// Single Axios instance used by every page — base URL points to our Express backend
const api = axios.create({
  baseURL: "https://storemax-lnam.onrender.com/api",
});

// Request interceptor: runs before every API call
// Reads token from localStorage and attaches it as a Bearer header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
