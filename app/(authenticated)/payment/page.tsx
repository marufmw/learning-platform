"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  useGetPaymentHistoryQuery,
  useGetMeQuery,
  useStartPlanMutation,
} from "@/lib/api/hooks";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
  Users,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const PLANS = [
  {
    name: "SOLO_EXPLORER",
    label: "Solo Explorer",
    price: "$199",
    description: "Perfect for one child's learning journey",
    features: ["1 child profile", "All 6 modules", "Progress tracking", "Brain type discovery"],
    icon: Zap,
  },
  {
    name: "FAMILY_PACK",
    label: "Family Pack",
    price: "$300",
    description: "Great value for families with multiple children",
    features: ["Multiple child profiles", "All 6 modules", "Progress tracking", "Brain type discovery"],
    icon: Users,
    featured: true,
  },
];

function StatusChip({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
    succeeded: { bg: "rgba(35,165,89,0.15)", color: "var(--dc-green)", icon: CheckCircle2 },
    pending: { bg: "rgba(240,177,50,0.15)", color: "var(--dc-yellow)", icon: Clock },
    failed: { bg: "rgba(242,63,66,0.12)", color: "var(--dc-red)", icon: XCircle },
  };
  const s = styles[status] ?? styles.pending;
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PaymentPageContent() {
  const { isLoaded, userId } = useAuth();
  const { data: user, refetch: refetchUser } = useGetMeQuery(undefined, { skip: !isLoaded || !userId });
  const { data: history } = useGetPaymentHistoryQuery(undefined, { skip: !isLoaded || !userId });
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
    } catch (err) {
      let errorMsg = "Failed to start plan";
      if (err && typeof err === "object") {
        const e = err as {data?: { message?: string } ; message?: string };
        errorMsg = e?.data?.message || e?.message || errorMsg;
      }
      console.log(err)
      setError(errorMsg);
      setSelectedPlan(null);
    }
  };

  const currentPlan = user?.activePlan?.plan?.name;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-3xl mx-auto" style={{ color: "var(--dc-text-normal)" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-0.5">Plans & Billing</h1>
        <p className="text-sm" style={{ color: "var(--dc-text-muted)" }}>Manage your subscription and view payment history</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg mb-5 border"
          style={{ background: "rgba(242,63,66,0.08)", borderColor: "rgba(242,63,66,0.25)" }}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dc-red)" }} />
          <p className="text-sm" style={{ color: "var(--dc-red)" }}>{error}</p>
        </div>
      )}

      {/* Current plan banner */}
      {currentPlan && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 border"
          style={{ background: "rgba(88,101,242,0.08)", borderColor: "rgba(88,101,242,0.25)" }}>
          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "var(--dc-blurple)" }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              Active Plan: {PLANS.find(p => p.name === currentPlan)?.label ?? currentPlan}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
              {user?.activePlan?.trialEndsAt && (
                <p className="text-xs" style={{ color: "var(--dc-text-muted)" }}>
                  Trial ends: {new Date(user.activePlan.trialEndsAt).toLocaleDateString()}
                </p>
              )}
              {user?.activePlan?.purchasedAt && (
                <p className="text-xs" style={{ color: "var(--dc-text-muted)" }}>
                  Active since: {new Date(user.activePlan.purchasedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-0.5"
          style={{ color: "var(--dc-text-muted)" }}>Available Plans</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.name;
            const isProcessing = isLoading && selectedPlan === plan.name;
            const Icon = plan.icon;

            return (
              <div key={plan.name}
                className="rounded-xl border flex flex-col"
                style={{
                  background: plan.featured ? "rgba(88,101,242,0.07)" : "var(--dc-bg-secondary)",
                  borderColor: plan.featured ? "rgba(88,101,242,0.3)" : "var(--dc-border)",
                }}>
                {plan.featured && (
                  <div className="px-4 pt-3 pb-0">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(88,101,242,0.2)", color: "var(--dc-blurple)" }}>
                      Best Value
                    </span>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: plan.featured ? "rgba(88,101,242,0.2)" : "rgba(255,255,255,0.06)" }}>
                      <Icon className="w-4 h-4" style={{ color: plan.featured ? "var(--dc-blurple)" : "var(--dc-text-muted)" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{plan.label}</p>
                      <p className="text-xs" style={{ color: "var(--dc-text-muted)" }}>{plan.description}</p>
                    </div>
                  </div>

                  <p className="text-3xl font-bold text-white mb-4">{plan.price}</p>

                  <ul className="space-y-1.5 mb-5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--dc-text-muted)" }}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--dc-green)" }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleStartPlan(plan.name)}
                    disabled={isLoading || isCurrent}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-40"
                    style={{
                      background: isCurrent ? "rgba(35,165,89,0.15)"
                        : plan.featured ? "var(--dc-blurple)"
                          : "var(--dc-bg-modifier-hover)",
                      color: isCurrent ? "var(--dc-green)"
                        : plan.featured ? "white"
                          : "var(--dc-text-normal)",
                    }}
                  >
                    {isCurrent ? (
                      <><CheckCircle2 className="w-4 h-4" /> Current Plan</>
                    ) : isProcessing ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                    ) : (
                      <><ExternalLink className="w-4 h-4" /> Choose Plan</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment history */}
      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b" style={{ borderColor: "var(--dc-border)" }}>
          <CreditCard className="w-4 h-4" style={{ color: "var(--dc-blurple)" }} />
          <h2 className="text-sm font-semibold text-white">Payment History</h2>
        </div>

        {history && history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--dc-border)" }}>
                  {["Date", "Plan", "Amount", "Status", "Invoice"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--dc-text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((payment, idx) => (
                  <tr key={idx}
                    className="transition-colors"
                    style={{ borderBottom: idx < history.length - 1 ? "1px solid var(--dc-border-subtle)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--dc-bg-modifier-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-5 py-3 text-sm" style={{ color: "var(--dc-text-muted)" }}>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-sm text-white">
                      {typeof payment.plan === "string" ? payment.plan : payment.plan?.name}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-white">
                      ${(payment.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusChip status={payment.status} />
                    </td>
                    <td className="px-5 py-3">
                      {payment.invoicePdfUrl ? (
                        <a href={payment.invoicePdfUrl} target="_blank" rel="noreferrer"
                          className="text-blue-600 text-sm underline dark:text-blue-400 hover:underline">
                          download
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No invoice</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <CreditCard className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--dc-text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--dc-text-muted)" }}>No payment history yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function PaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentPageContent />
    </Elements>
  );
}
