"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useGetHealthQuery, useGetMeQuery } from "@/lib/api/hooks";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useGetMeQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { data: healthData, isLoading, error } = useGetHealthQuery(undefined, {
    skip: !isLoaded || !userId,
  });

  // Redirect to trial selection if user doesn't have a plan
  useEffect(() => {
    if (!userLoading && user && !user.activePlan?.plan?.name) {
      router.push("/trial-selection");
    }
  }, [user, userLoading, router]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome back! Your user ID: {userId}</p>

      <div className="mt-8 p-4 border rounded bg-gray-50 mb-8">
        <h2 className="font-semibold mb-2">Backend Status</h2>
        {isLoading && <p className="text-sm text-gray-600">Checking...</p>}
        {error && <p className="text-sm text-red-600">Backend unavailable</p>}
        {healthData && (
          <p className="text-sm text-green-600">Backend: {healthData.status}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/modules"
          className="border rounded p-4 hover:shadow-lg hover:border-blue-600 transition"
        >
          <h2 className="font-semibold text-lg mb-2">📚 Modules & Quests</h2>
          <p className="text-sm text-gray-600">Access learning modules and complete quests</p>
        </Link>

        <Link
          href="/children"
          className="border rounded p-4 hover:shadow-lg hover:border-blue-600 transition"
        >
          <h2 className="font-semibold text-lg mb-2">👶 Children</h2>
          <p className="text-sm text-gray-600">Manage child profiles</p>
        </Link>

        <Link
          href="/payment"
          className="border rounded p-4 hover:shadow-lg hover:border-blue-600 transition"
        >
          <h2 className="font-semibold text-lg mb-2">💳 Plans & Payments</h2>
          <p className="text-sm text-gray-600">Manage subscription and payment history</p>
        </Link>
      </div>

      {user && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm">
            Current Plan: <strong>{user.activePlan?.plan?.name || "None"}</strong>
          </p>
          {user.activePlan?.trialEndsAt && (
            <p className="text-sm text-gray-600">
              Trial Ends: {new Date(user.activePlan.trialEndsAt).toLocaleDateString()}
            </p>
          )}
          {user.activePlan?.purchasedAt && (
            <p className="text-sm text-gray-600">
              Active Since: {new Date(user.activePlan.purchasedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
