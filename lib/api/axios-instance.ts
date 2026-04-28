import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 30000,
});

instance.interceptors.request.use(async (config) => {
  let token = (typeof window !== "undefined" && (window as any).__clerkToken) || null;

  // If no cached token, try to fetch one
  if (!token && typeof window !== "undefined") {
    const getToken = (window as any).__getClerkToken;
    if (getToken) {
      try {
        token = await getToken();
        if (token) {
          (window as any).__clerkToken = token;
        }
      } catch (e) {
        console.error("Failed to get Clerk token in request interceptor:", e);
      }
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - check Clerk token validity");
    }
    return Promise.reject(error);
  }
);

export default instance;
