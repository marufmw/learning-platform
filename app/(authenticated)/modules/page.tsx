"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useGetAccessListQuery, useGetChildrenQuery } from "@/lib/api/hooks";
import { getAccessInfo } from "@/lib/api/access-list";
import { useSelectedChild } from "@/lib/context/ChildContext";

export default function ModulesPage() {
  const { isLoaded, userId } = useAuth();
  const { data: children } = useGetChildrenQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { selectedChildId } = useSelectedChild();

  const { data: accessList, isLoading } = useGetAccessListQuery(
    selectedChildId ? { childId: selectedChildId } : undefined,
    { skip: !selectedChildId }
  );

  const selectedChild = children?.find((c) => c.id === selectedChildId);

  if (!selectedChild) {
    return (
      <div className="min-h-[60vh] bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-2xl mb-4">👶</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No Child Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please select a child in settings to start learning
          </p>
          <Link
            href="/settings"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  const modules = [1, 2, 3, 4, 5, 6];

  return (
    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
            <span className="text-5xl">{selectedChild.gender === "male" ? "👨" : "👩"}</span>
            <span>{selectedChild.name}&apos;s Modules</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a module to explore and learn
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading modules...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((moduleNo) => {
            const info = getAccessInfo("module", accessList, moduleNo);
            const isUnlocked = info?.unlocked ?? false;
            const isAccessible = info?.accessible ?? false;
            const isCompleted = info?.isCompleted ?? false;
            const canAccess = isUnlocked && isAccessible;

            return (
              <Link
                key={moduleNo}
                href={canAccess ? `/modules/${moduleNo}` : "#"}
                className={`rounded-xl border-2 p-6 transition transform ${
                  canAccess
                    ? "bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-900 hover:shadow-lg hover:scale-105 cursor-pointer"
                    : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Module {moduleNo}
                  </h3>
                  {isCompleted && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                      ✓ Complete
                    </span>
                  )}
                </div>

                {!isUnlocked && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">🔒 Locked</p>
                    {info?.unlockedAt ? (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Unlocks on {new Date(info.unlockedAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Purchase a plan to unlock.
                      </p>
                    )}
                  </div>
                )}

                {isUnlocked && !isAccessible && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">🔐 Inaccessible</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Complete Module {moduleNo - 1} to unlock
                    </p>
                  </div>
                )}

                {canAccess && !isCompleted && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    🎯 Ready to Learn →
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
