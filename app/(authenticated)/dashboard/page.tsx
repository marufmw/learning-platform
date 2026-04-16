"use client";

import { useAuth } from "@clerk/nextjs";

export default function DashboardPage() {
  const { userId } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome back! Your user ID: {userId}</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold">Billing</h2>
          <p className="text-sm text-gray-600 mt-2">Manage your subscription</p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold">Profile</h2>
          <p className="text-sm text-gray-600 mt-2">View and edit your profile</p>
        </div>
      </div>
    </div>
  );
}
