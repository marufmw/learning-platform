import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 30000,
});

instance.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const getToken = (window as any).__getClerkToken;
  if (!getToken) {
    return config;
  }

  try {
    // Always get a fresh token for requests to ensure it's not expired
    // The { forceRefresh: true } option is not standard, but we can skip caching
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error("Failed to get Clerk token:", e);
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        (window as any).__clerkToken = null;
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
