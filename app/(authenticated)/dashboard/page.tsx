"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useGetMeQuery, useGetAccessHierarchyQuery, useGetChildrenQuery, useGetProgressQuery } from "@/lib/api/hooks";
import { useSelectedChild } from "@/lib/context/ChildContext";
import { useEffect } from "react";

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

  const { data: accessStatus } = useGetAccessHierarchyQuery(
    selectedChildId ? { childId: selectedChildId } : undefined,
    { skip: !selectedChildId }
  );

  const { data: progressData } = useGetProgressQuery(
    selectedChildId ? { childId: selectedChildId } : undefined,
    { skip: !selectedChildId }
  );

  const selectedChild = children?.find((c) => c.id === selectedChildId);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const getModuleProgress = (moduleNo: number) => {
    const moduleStatus = accessStatus?.[`module_${moduleNo}`];
    if (!moduleStatus) return 0;
    if (moduleStatus.isCompleted) return 100;
    // Simple progress calculation
    return moduleStatus.accessible ? 50 : 0;
  };

  const modules = [1, 2, 3, 4, 5, 6];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        {selectedChild && (
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Welcome back! Let's continue learning
            </p>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="text-5xl">{selectedChild.gender === "male" ? "👨" : "👩"}</span>
              <span>{selectedChild.name}</span>
            </h1>
          </div>
        )}

        {/* Stats */}
        {selectedChild && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Screens Completed</p>
              <p className="text-3xl font-bold text-blue-600">
                {progressData?.completedScreens ?? 0}/{progressData?.totalScreens ?? 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Progress</p>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${progressData?.progressPercentage ?? 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {progressData?.progressPercentage ?? 0}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Plan</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.activePlan?.plan?.name || "Trial"}
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/modules"
            className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-8 hover:shadow-xl transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">📚</div>
            <h2 className="text-2xl font-bold mb-2">Continue Learning</h2>
            <p className="text-blue-100 group-hover:text-white transition">
              Access all modules and quests
            </p>
          </Link>
          <Link
            href="/settings"
            className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-8 hover:shadow-xl transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">⚙️</div>
            <h2 className="text-2xl font-bold mb-2">Settings</h2>
            <p className="text-purple-100 group-hover:text-white transition">
              Manage children and account
            </p>
          </Link>
        </div>

        {/* Module Overview */}
        {selectedChild && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Module Progress
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {modules.map((moduleNo) => {
                const status = accessStatus?.[`module_${moduleNo}`];
                const isCompleted = status?.isCompleted;
                const isUnlocked = status?.unlocked ?? false;
                const isAccessible = status?.accessible ?? false;
                const canAccess = isUnlocked && isAccessible;

                return (
                  <Link
                    key={moduleNo}
                    href={canAccess ? `/modules/${moduleNo}` : "#"}
                    className={`p-4 rounded-lg border-2 transition group relative ${
                      isCompleted
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : canAccess
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:shadow-lg"
                        : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {moduleNo}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {isCompleted ? "✓ Done" : canAccess ? "Unlocked" : "Locked"}
                      </p>
                    </div>
                    {!canAccess && (
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded p-2 whitespace-nowrap z-10">
                        {!isUnlocked ? (
                          status?.unlockDate ? (
                            <span>Unlocks {new Date(status.unlockDate).toLocaleDateString()}</span>
                          ) : (
                            <span>Locked</span>
                          )
                        ) : (
                          <span>Complete Module {moduleNo - 1} first</span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {!selectedChild && children && children.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-xl p-6 text-center">
            <p className="text-yellow-800 dark:text-yellow-200">
              Please select a child in settings to get started
            </p>
            <Link
              href="/settings"
              className="inline-block mt-3 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              Go to Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
