import axios from "axios";
import { API_BASE_URL } from "../constants/env";

export const http = axios.create({
  baseURL: API_BASE_URL, 
  withCredentials: true,
});

// Interceptor is middleware and they will make sure to always send access_token in the request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => {
    res.data = camilizeKeys(res.data);
    return res;
  },
  (err) => {
    console.error("API error:", err);
    return Promise.reject(err);
  }
);

function camilizeKeys(data: any): any {
  if (Array.isArray(data)) {
    return data.map(camilizeKeys);
  }
  if (data !== null && typeof data === "object") {
    return Object.keys(data).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      acc[camelKey] = camilizeKeys(data[key]);
      return acc;
    }, {} as any);
  }
  return data;
}

