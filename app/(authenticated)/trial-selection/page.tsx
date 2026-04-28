"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStartTrialMutation, useGetMeQuery } from "@/lib/api/hooks";
import { useAuth } from "@clerk/nextjs";

export default function TrialSelectionPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { data: user } = useGetMeQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { mutate: startTrial, isLoading } = useStartTrialMutation();
  const [error, setError] = useState("");

  // If user already has a plan, redirect to modules
  if (user?.activePlan?.plan?.name) {
    router.push("/modules");
    return null;
  }

  const handleStartTrial = async () => {
    try {
      setError("");
      await startTrial(undefined);
      router.push("/modules");
    } catch (err: any) {
      setError(err.message || "Failed to start trial");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md p-8 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome! 🎉
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start your 14-day free trial to access all modules and quests.
        </p>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-6 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        <button
          onClick={handleStartTrial}
          disabled={isLoading}
          className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 disabled:opacity-50 font-medium transition"
        >
          {isLoading ? "Starting Trial..." : "Start Free Trial (14 days)"}
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          💳 No credit card required. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
