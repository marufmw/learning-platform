"use client";

import { useAuth } from "@clerk/nextjs";
import { useGetHealthQuery } from "@/lib/api/api-slice";

export default function DashboardPage() {
  const { userId } = useAuth();
  const { data: healthData, isLoading, error } = useGetHealthQuery();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome back! Your user ID: {userId}</p>

      <div className="mt-8 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Backend Status</h2>
        {isLoading && <p className="text-sm text-gray-600">Checking...</p>}
        {error && <p className="text-sm text-red-600">Backend unavailable</p>}
        {healthData && (
          <p className="text-sm text-green-600">Backend: {healthData.status}</p>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold">Subscription</h2>
          <p className="text-sm text-gray-600 mt-2">View subscription via API</p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold">Profile</h2>
          <p className="text-sm text-gray-600 mt-2">Managed by Clerk</p>
        </div>
      </div>
    </div>
  );
}
