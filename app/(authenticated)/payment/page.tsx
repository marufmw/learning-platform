"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  useGetPaymentHistoryQuery,
  useGetMeQuery,
  useStartPlanMutation,
} from "@/lib/api/hooks";

const PLANS = [
  { name: "SOLO_EXPLORER", label: "Solo Explorer", price: "$9.99/mo" },
  { name: "FAMILY_PACK", label: "Family Pack", price: "$19.99/mo" },
];

export default function PaymentPage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { data: user } = useGetMeQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { data: history } = useGetPaymentHistoryQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { mutate: startPlan, isLoading } = useStartPlanMutation();
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleStartPlan = async (planName: string) => {
    try {
      setError("");
      setSelectedPlan(planName);
      const response = await startPlan({ planName });
      if (response?.url) {
        window.location.href = response.url;
      } else {
        setError("No checkout URL received");
        setSelectedPlan(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to start plan");
      setSelectedPlan(null);
    }
  };

  const currentPlan = user?.activePlan?.plan?.name;

  return (
    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Plans & Payments
        </h1>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-6 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {currentPlan && (
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg mb-8">
            <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
              <strong className="text-base">Current Plan: {currentPlan}</strong>
            </p>
            {user?.activePlan?.trialEndsAt && (
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Trial Ends: {new Date(user.activePlan.trialEndsAt).toLocaleDateString()}
              </p>
            )}
            {user?.activePlan?.purchasedAt && (
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Active Since: {new Date(user.activePlan.purchasedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Available Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.label}
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                  {plan.price}
                </p>
                <button
                  onClick={() => handleStartPlan(plan.name)}
                  disabled={isLoading || selectedPlan === plan.name || currentPlan === plan.name}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    currentPlan === plan.name
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-default"
                      : isLoading && selectedPlan === plan.name
                      ? "bg-blue-500 dark:bg-blue-600 text-white"
                      : "bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700"
                  }`}
                >
                  {currentPlan === plan.name
                    ? "Current Plan"
                    : isLoading && selectedPlan === plan.name
                    ? "Processing..."
                    : "Choose Plan"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Payment History
          </h2>
          {history && history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Plan
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((payment, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                        {typeof payment.plan === "string"
                          ? payment.plan
                          : payment.plan?.name}
                      </td>
                      <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">
                        ${(payment.amount / 100).toFixed(2)}
                      </td>
                      <td className="p-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.status === "completed"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : payment.status === "pending"
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No payment history
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
