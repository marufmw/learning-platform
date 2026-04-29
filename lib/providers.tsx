"use client";

import { useEffect } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const { signOut } = useClerk();

  useEffect(() => {
    if (getToken) {
      (window as any).__getClerkToken = getToken;
    }
  }, [getToken]);

  useEffect(() => {
    (window as any).__clerkSignOut = signOut;
  }, [signOut]);

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
