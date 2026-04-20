import axios from 'axios';
 
// frontend/src/lib/axios.js
export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:5001/api"
    : "/api",  // ← same origin in production
  withCredentials: true,
});