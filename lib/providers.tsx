"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    // Store getToken function in window so axios interceptor can use it
    if (getToken) {
      (window as any).__getClerkToken = getToken;
    }
  }, [getToken]);

  useEffect(() => {
    if (!isSignedIn || !getToken) return;

    const refreshToken = async () => {
      try {
        const token = await getToken();
        if (token) {
          (window as any).__clerkToken = token;
        }
      } catch (e) {
        console.error("Failed to refresh Clerk token:", e);
      }
    };

    // Fetch immediately
    refreshToken();

    // Refresh every 30 seconds
    const interval = setInterval(refreshToken, 30000);
    return () => clearInterval(interval);
  }, [getToken, isSignedIn]);

  return <>{children}</>;
}
