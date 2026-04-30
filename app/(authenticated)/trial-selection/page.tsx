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
    <div className="flex items-center justify-center min-h-screen bg-[#313338]">
      <div className="w-full max-w-md p-8 rounded-md bg-[#2b2d31] shadow-xl">
        <h1 className="text-2xl font-semibold text-[#f2f3f5] mb-3">
          Welcome!
        </h1>

        <p className="text-[#b5bac1] mb-6 text-sm">
          Start your 14-day free trial to access all modules and quests.
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 text-red-400 rounded-md mb-4 border border-red-500/20 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleStartTrial}
          disabled={isLoading}
          className="w-full bg-[#5865F2] text-white py-2.5 rounded-md hover:bg-[#4752c4] disabled:opacity-50 font-medium transition"
        >
          {isLoading ? "Starting Trial..." : "Start Free Trial"}
        </button>

        <p className="text-xs text-[#949ba4] mt-5 text-center">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </div>
  );
}