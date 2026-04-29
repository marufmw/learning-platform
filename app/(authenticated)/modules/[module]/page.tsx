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
import {
  CheckCircle2,
  Circle,
  Lock,
  Clock,
  ChevronLeft,
  Play,
} from "lucide-react";

export default function ModuleDetailPage() {
  const params = useParams();
  const moduleNo = parseInt(params.module as string);
  const { isLoaded, userId } = useAuth();
  const { data: children } = useGetChildrenQuery(undefined, { skip: !isLoaded || !userId });
  const { data: registry } = useGetModuleRegistryQuery(undefined, { skip: !isLoaded || !userId });
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
      <div className="flex items-center justify-center min-h-screen px-4" style={{ color: "var(--dc-text-normal)" }}>
        <div className="text-center">
          <Link href="/modules" className="inline-flex items-center gap-1.5 text-sm mb-4 hover:underline"
            style={{ color: "var(--dc-blurple)" }}>
            <ChevronLeft className="w-4 h-4" /> Back to Modules
          </Link>
          <h2 className="text-xl font-bold text-white mb-2">No Child Selected</h2>
          <p className="text-sm" style={{ color: "var(--dc-text-muted)" }}>Please select a child in settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-3xl mx-auto" style={{ color: "var(--dc-text-normal)" }}>
      <Link href="/modules" className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "var(--dc-blurple)" }}>
        <ChevronLeft className="w-4 h-4" /> Back to Modules
      </Link>

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white mb-0.5">Module {moduleNo}</h1>
        <p className="text-sm" style={{ color: "var(--dc-text-muted)" }}>{quests.length} quests to complete</p>
      </div>

      {!isModuleUnlocked && (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5 border"
          style={{ background: "rgba(240,177,50,0.08)", borderColor: "rgba(240,177,50,0.2)" }}>
          <Lock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dc-yellow)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--dc-yellow)" }}>Module Locked</p>
            {moduleInfo?.unlockedAt ? (
              <p className="text-xs mt-0.5" style={{ color: "var(--dc-text-muted)" }}>
                Unlocks on {new Date(moduleInfo.unlockedAt).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-xs mt-0.5" style={{ color: "var(--dc-text-muted)" }}>Purchase a plan to unlock.</p>
            )}
          </div>
        </div>
      )}

      {isModuleUnlocked && !isModuleAccessible && (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5 border"
          style={{ background: "rgba(240,177,50,0.08)", borderColor: "rgba(240,177,50,0.2)" }}>
          <Lock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dc-yellow)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--dc-yellow)" }}>Complete Previous Modules First</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--dc-text-muted)" }}>
              Finish Module {moduleNo - 1} to unlock this module
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {quests.map((questNo) => {
          const questInfo = getAccessInfo("quest", accessList, moduleNo, questNo);
          const questAccessible = questInfo?.accessible ?? false;
          const questCompleted = questInfo?.isCompleted ?? false;
          const questStatus = questInfo?.status ?? "initialized";
          const questScreens = module?.quests[questNo]?.screens || 0;
          const screenNos = Array.from({ length: questScreens }, (_, i) => i + 1);

          return (
            <div key={questNo} className="rounded-xl border overflow-hidden"
              style={{
                background: "var(--dc-bg-secondary)",
                borderColor: questCompleted ? "rgba(35,165,89,0.25)"
                  : questStatus === "ongoing" ? "rgba(240,177,50,0.2)"
                  : "var(--dc-border)",
              }}>
              <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: "var(--dc-border)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: questCompleted ? "rgba(35,165,89,0.15)"
                      : questStatus === "ongoing" ? "rgba(240,177,50,0.15)"
                      : questAccessible ? "rgba(88,101,242,0.15)"
                      : "rgba(255,255,255,0.05)",
                    color: questCompleted ? "var(--dc-green)"
                      : questStatus === "ongoing" ? "var(--dc-yellow)"
                      : questAccessible ? "var(--dc-blurple)"
                      : "var(--dc-text-muted)",
                  }}>
                  {questCompleted ? <CheckCircle2 className="w-4 h-4" /> : questNo}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Quest {questNo}</p>
                  <p className="text-xs" style={{ color: "var(--dc-text-muted)" }}>
                    {questScreens} screen{questScreens !== 1 ? "s" : ""}
                  </p>
                </div>
                {!questAccessible && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "var(--dc-text-muted)" }}>
                    <Lock className="w-3 h-3" />
                    {questInfo?.unlockedAt
                      ? new Date(questInfo.unlockedAt).toLocaleDateString()
                      : "Locked"}
                  </span>
                )}
                {questCompleted && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(35,165,89,0.15)", color: "var(--dc-green)" }}>
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                )}
                {questStatus === "ongoing" && !questCompleted && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(240,177,50,0.15)", color: "var(--dc-yellow)" }}>
                    <Clock className="w-3 h-3" /> Active
                  </span>
                )}
              </div>

              <div className="px-4 py-3">
                {screenNos.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--dc-text-muted)" }}>No screens in this quest</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {screenNos.map((screenNo) => {
                      const screenInfo = getAccessInfo("screen", accessList, moduleNo, questNo, screenNo);
                      const screenAccessible = screenInfo?.accessible ?? false;
                      const screenCompleted = screenInfo?.isCompleted ?? false;

                      return (
                        <Link
                          key={screenNo}
                          href={screenAccessible && selectedChildId
                            ? `/modules/${moduleNo}/quests/${questNo}/screens/${screenNo}`
                            : "#"}
                          className="relative group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: screenCompleted ? "rgba(35,165,89,0.15)"
                              : screenAccessible ? "rgba(88,101,242,0.15)"
                              : "rgba(255,255,255,0.04)",
                            color: screenCompleted ? "var(--dc-green)"
                              : screenAccessible ? "var(--dc-blurple)"
                              : "var(--dc-text-muted)",
                            border: `1px solid ${screenCompleted ? "rgba(35,165,89,0.25)"
                              : screenAccessible ? "rgba(88,101,242,0.25)"
                              : "transparent"}`,
                            cursor: screenAccessible ? "pointer" : "default",
                          }}
                        >
                          {screenCompleted ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : screenAccessible ? (
                            <Play className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          Screen {screenNo}

                          {!screenAccessible && (
                            <span className="hidden group-hover:block absolute bottom-full left-0 mb-1.5 px-2 py-1 rounded text-xs whitespace-nowrap z-10"
                              style={{ background: "var(--dc-bg-floating)", color: "var(--dc-text-normal)", border: "1px solid var(--dc-border)" }}>
                              {!questAccessible ? "Quest locked"
                                : screenInfo?.unlockedAt ? `Unlocks ${new Date(screenInfo.unlockedAt).toLocaleDateString()}`
                                : "Complete previous screens first"}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {quests.length === 0 && (
          <div className="text-center py-12 rounded-xl border"
            style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
            <Circle className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--dc-text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--dc-text-muted)" }}>No quests found for this module</p>
          </div>
        )}
      </div>
    </div>
  );
}
