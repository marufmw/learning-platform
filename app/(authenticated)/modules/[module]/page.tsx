"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  useGetChildrenQuery,
  useGetModuleRegistryQuery,
  useGetAccessListQuery,
} from "@/lib/api/hooks";
import { getAccessInfo } from "@/lib/api/access-list";
import { useSelectedChild } from "@/lib/context/ChildContext";

export default function ModuleDetailPage() {
  const params = useParams();
  const moduleNo = parseInt(params.module as string);
  const { isLoaded, userId } = useAuth();
  const { data: children } = useGetChildrenQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { data: registry } = useGetModuleRegistryQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { selectedChildId } = useSelectedChild();

  const { data: accessList } = useGetAccessListQuery(
    selectedChildId ? { childId: selectedChildId, include: ["quest", "screen"] } : undefined,
    { skip: !selectedChildId }
  );

  const selectedChild = children?.find((c) => c.id === selectedChildId);

  const module = registry?.perModule?.[moduleNo];
  const quests = module ? Object.keys(module.quests).map(Number) : [];

  const moduleInfo = getAccessInfo("module", accessList, moduleNo);
  const isModuleUnlocked = moduleInfo?.unlocked ?? false;
  const isModuleAccessible = moduleInfo?.accessible ?? false;

  if (!selectedChild) {
    return (
      <div className="min-h-[60vh] bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Link href="/modules" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
            ← Back to Modules
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No Child Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please select a child in settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/modules" className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block font-medium">
          ← Back to Modules
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
            <span className="text-5xl">{selectedChild.gender === "male" ? "👨" : "👩"}</span>
            <span>Module {moduleNo}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {quests.length} quests to complete
          </p>
        </div>

        {!isModuleUnlocked && (
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg mb-6 border border-yellow-200 dark:border-yellow-900">
            <p className="font-medium mb-1">🔒 Module is locked</p>
            {moduleInfo?.unlockedAt ? (
              <p className="text-sm">
                Unlocks on {new Date(moduleInfo.unlockedAt).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-sm">Purchase a plan to unlock.</p>
            )}
          </div>
        )}

        {isModuleUnlocked && !isModuleAccessible && (
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg mb-6 border border-yellow-200 dark:border-yellow-900">
            <p className="font-medium mb-1">🔐 Complete previous modules first</p>
            <p className="text-sm">
              This module becomes available after you complete Module {moduleNo - 1}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {quests.map((questNo) => {
            const questInfo = getAccessInfo("quest", accessList, moduleNo, questNo);
            const questAccessible = questInfo?.accessible ?? false;
            const questCompleted = questInfo?.isCompleted ?? false;
            const questScreens = module?.quests[questNo]?.screens || 0;
            const screenNos = Array.from({ length: questScreens }, (_, i) => i + 1);

            return (
              <div key={questNo} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Quest {questNo}
                    {questCompleted && <span className="ml-3 text-lg">✅</span>}
                  </h2>
                  {!questAccessible && (
                    <span className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-full">
                      🔒 Locked
                    </span>
                  )}
                </div>

                {!questAccessible && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded text-yellow-800 dark:text-yellow-200 text-sm">
                    {questInfo?.unlockedAt ? (
                      <p>Unlocks on {new Date(questInfo.unlockedAt).toLocaleDateString()}</p>
                    ) : (
                      <p>Complete previous quests to unlock</p>
                    )}
                  </div>
                )}

                {screenNos.length === 0 ? (
                  <p className="text-gray-500 text-sm">No screens in this quest</p>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {screenNos.map((screenNo) => {
                      const screenInfo = getAccessInfo("screen", accessList, moduleNo, questNo, screenNo);
                      const screenAccessible = screenInfo?.accessible ?? false;
                      const screenCompleted = screenInfo?.isCompleted ?? false;

                      return (
                        <div key={screenNo} className="relative group">
                          <Link
                            href={
                              screenAccessible && selectedChildId
                                ? `/modules/${moduleNo}/quests/${questNo}/screens/${screenNo}`
                                : "#"
                            }
                            className={`px-4 py-2 rounded-lg font-medium transition block ${
                              screenAccessible && selectedChildId
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105"
                                : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              Screen {screenNo}
                              {screenCompleted && "✓"}
                            </span>
                          </Link>
                          {!screenAccessible && (
                            <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded p-2 whitespace-nowrap z-10">
                              {!questAccessible ? (
                                <span>Quest locked</span>
                              ) : screenInfo?.unlockedAt ? (
                                <span>Unlocks {new Date(screenInfo.unlockedAt).toLocaleDateString()}</span>
                              ) : (
                                <span>Complete previous screens first</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {quests.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No quests found for this module</p>
          </div>
        )}
      </div>
    </div>
  );
}
