"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  useGetMeQuery,
  useGetChildrenQuery,
  useGetChildDashboardQuery,
} from "@/lib/api/hooks";
import { useSelectedChild } from "@/lib/context/ChildContext";
import { useEffect } from "react";

const MODULE_NAMES: Record<number, string> = {
  1: "Start Busy Brains",
  2: "Meet Feelings Brain",
  3: "Meet Your Senses!",
  4: "Feel More Senses!",
  5: "Build Your Toolkit",
  6: "My Brain Journey",
};

const BRAIN_ICONS: Record<string, string> = {
  "The Mover Brain": "🏃",
  "Cozy Brain": "🛋️",
  "Fidget Brain": "🌀",
  "Quiet Brain": "🌙",
};

function ModuleStatusIcon({ status, accessible }: { status: string; accessible: boolean }) {
  if (status === "completed") {
    return (
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (status === "ongoing") {
    return (
      <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
      </span>
    );
  }
  // initialized / locked
  return (
    <span
      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 ${
        accessible
          ? "border-gray-400 dark:border-gray-500"
          : "border-gray-600 dark:border-gray-700"
      }`}
    />
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { data: user, isLoading: userLoading } = useGetMeQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { data: children } = useGetChildrenQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { selectedChildId } = useSelectedChild();

  useEffect(() => {
    if (!userLoading && user && !user.activePlan?.plan?.name) {
      router.push("/trial-selection");
    }
  }, [user, userLoading, router]);

  const { data: dashboardData } = useGetChildDashboardQuery(
    selectedChildId ? { childId: selectedChildId, include: ["quest", "screen"] } : undefined,
    { skip: !selectedChildId }
  );

  const selectedChild = children?.find((c) => c.id === selectedChildId);

  const completedModules = dashboardData?.progress?.modules.completed ?? 0;
  const totalModules = dashboardData?.progress?.modules.total ?? 6;
  const progressPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-500 rounded-full animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Welcome */}
        {selectedChild && (
          <div>
            <p className="text-gray-400 text-sm mb-1">Welcome back! Let&apos;s continue learning</p>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="text-4xl">{selectedChild.gender === "male" ? "👦" : "👧"}</span>
              {selectedChild.name}
            </h1>
          </div>
        )}

        {/* Stats row */}
        {selectedChild && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Modules", value: `${dashboardData?.progress?.modules.completed ?? 0}/${dashboardData?.progress?.modules.total ?? 0}`, color: "text-emerald-400" },
              { label: "Quests", value: `${dashboardData?.progress?.quests.completed ?? 0}/${dashboardData?.progress?.quests.total ?? 0}`, color: "text-purple-400" },
              { label: "Screens", value: `${dashboardData?.progress?.screens.completed ?? 0}/${dashboardData?.progress?.screens.total ?? 0}`, color: "text-blue-400" },
              { label: "Overall", value: `${dashboardData?.progress?.progressPercentage ?? 0}%`, color: "text-amber-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Brain Type */}
        {selectedChild && (
          dashboardData?.brain_data.status === "completed" ? (
            <div className="bg-linear-to-br from-purple-600 to-indigo-700 rounded-xl p-5 flex items-center gap-5">
              <span className="text-5xl shrink-0">
                {BRAIN_ICONS[dashboardData.brain_data.type] ?? "🧠"}
              </span>
              <div>
                <p className="text-purple-200 text-xs font-medium uppercase tracking-widest mb-1">Brain Type</p>
                <p className="text-xl font-bold">{dashboardData.brain_data.type}</p>
                <div className="flex gap-3 mt-1 text-sm text-purple-200">
                  {(["A", "B", "C", "D"] as const).map((l) => (
                    <span key={l}>{l}: {dashboardData.brain_data.counts[l]}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
              <span className="text-3xl">🧠</span>
              <div>
                <p className="font-medium text-gray-200 text-sm">Brain Type Unknown</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete Module 1 → Quest 5 → Screen 2 to reveal the brain type.
                </p>
              </div>
            </div>
          )
        )}

        {/* Module Progress card */}
        {selectedChild && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-lg">📖</span>
                <h2 className="font-semibold text-base">Module Progress</h2>
              </div>
              <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full">
                {completedModules}/{totalModules}
              </span>
            </div>

            {/* Progress bar */}
            <div className="px-5 pt-4 pb-2">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${dashboardData?.progress?.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Module list */}
            <ul className="divide-y divide-gray-800/60 px-2 pb-2">
              {(dashboardData?.module_progress ?? Array.from({ length: 6 }, (_, i) => ({
                module: i + 1,
                status: "initialized" as const,
                accessible: false,
                unlocked: false,
                unlockedAt: null,
              }))).map((m) => {
                const canNavigate = m.unlocked && m.accessible;
                const isLocked = !m.unlocked;
                const name = MODULE_NAMES[m.module] ?? `Module ${m.module}`;

                return (
                  <li key={m.module}>
                    <Link
                      href={canNavigate ? `/modules/${m.module}` : "#"}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        canNavigate
                          ? "hover:bg-gray-800 cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      <ModuleStatusIcon status={m.status} accessible={m.accessible} />
                      <span
                        className={`text-sm font-medium ${
                          m.status === "completed"
                            ? "text-white"
                            : m.status === "ongoing"
                            ? "text-amber-300"
                            : isLocked
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {name}
                      </span>
                      {isLocked && m.unlockedAt && (
                        <span className="ml-auto text-xs text-gray-600">
                          {new Date(m.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/modules"
            className="group bg-linear-to-br from-emerald-600 to-teal-700 rounded-xl p-6 hover:shadow-xl transition hover:scale-[1.02]"
          >
            <div className="text-3xl mb-2">📚</div>
            <h2 className="text-lg font-bold mb-1">Continue Learning</h2>
            <p className="text-emerald-100 text-sm">Access all modules and quests</p>
          </Link>
          <Link
            href="/settings"
            className="group bg-linear-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:shadow-xl transition hover:scale-[1.02]"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <h2 className="text-lg font-bold mb-1">Settings</h2>
            <p className="text-gray-400 text-sm">Manage children and account</p>
          </Link>
        </div>

        {!selectedChild && children && children.length > 0 && (
          <div className="bg-yellow-950/40 border border-yellow-900/60 rounded-xl p-6 text-center">
            <p className="text-yellow-300 text-sm">Please select a child to get started</p>
            <Link
              href="/settings"
              className="inline-block mt-3 px-5 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-500 transition"
            >
              Go to Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
