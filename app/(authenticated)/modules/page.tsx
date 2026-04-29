"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useGetAccessListQuery, useGetChildrenQuery } from "@/lib/api/hooks";
import { getAccessInfo } from "@/lib/api/access-list";
import { useSelectedChild } from "@/lib/context/ChildContext";
import {
  CheckCircle2,
  Circle,
  Lock,
  Clock,
  ChevronRight,
  BookOpen,
} from "lucide-react";

const MODULE_NAMES: Record<number, string> = {
  1: "Start Busy Brains",
  2: "Meet Feelings Brain",
  3: "Meet Your Senses!",
  4: "Feel More Senses!",
  5: "Build Your Toolkit",
  6: "My Brain Journey",
};

const MODULE_DESCRIPTIONS: Record<number, string> = {
  1: "Begin your brain journey and discover how your mind works",
  2: "Explore emotions and how your feelings brain responds",
  3: "Discover the world through your five amazing senses",
  4: "Dive deeper into sensory experiences and awareness",
  5: "Build your personal toolkit for managing feelings",
  6: "Celebrate your unique brain and everything you've learned",
};

function StatusBadge({ status, accessible, unlocked }: { status: string; accessible: boolean; unlocked: boolean }) {
  if (status === "completed") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: "rgba(35,165,89,0.15)", color: "var(--dc-green)" }}>
        <CheckCircle2 className="w-3 h-3" /> Done
      </span>
    );
  }
  if (status === "ongoing") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: "rgba(240,177,50,0.15)", color: "var(--dc-yellow)" }}>
        <Clock className="w-3 h-3" /> In Progress
      </span>
    );
  }
  if (!unlocked) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)", color: "var(--dc-text-muted)" }}>
        <Lock className="w-3 h-3" /> Locked
      </span>
    );
  }
  if (!accessible) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)", color: "var(--dc-text-muted)" }}>
        <Lock className="w-3 h-3" /> Complete prev.
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: "rgba(88,101,242,0.15)", color: "var(--dc-blurple)" }}>
      <Circle className="w-3 h-3" /> Ready
    </span>
  );
}

export default function ModulesPage() {
  const { isLoaded, userId } = useAuth();
  const { data: children } = useGetChildrenQuery(undefined, { skip: !isLoaded || !userId });
  const { selectedChildId } = useSelectedChild();

  const { data: accessList, isLoading } = useGetAccessListQuery(
    selectedChildId ? { childId: selectedChildId } : undefined,
    { skip: !selectedChildId }
  );

  const selectedChild = children?.find((c) => c.id === selectedChildId);

  if (!selectedChild) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4" style={{ color: "var(--dc-text-normal)" }}>
        <div className="text-center max-w-sm">
          <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--dc-text-muted)" }} />
          <h2 className="text-xl font-bold text-white mb-2">No Child Selected</h2>
          <p className="text-sm mb-5" style={{ color: "var(--dc-text-muted)" }}>
            Select a child in settings to start learning
          </p>
          <Link href="/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--dc-blurple)" }}>
            Go to Settings <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const modules = [1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-3xl mx-auto" style={{ color: "var(--dc-text-normal)" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          {selectedChild.name}&apos;s Modules
        </h1>
        <p className="text-sm" style={{ color: "var(--dc-text-muted)" }}>
          Choose a module to explore and learn
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "var(--dc-bg-secondary)" }} />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {modules.map((moduleNo) => {
            const info = getAccessInfo("module", accessList, moduleNo);
            const isUnlocked = info?.unlocked ?? false;
            const isAccessible = info?.accessible ?? false;
            const isCompleted = info?.isCompleted ?? false;
            const status = info?.status ?? "initialized";
            const canAccess = isUnlocked && isAccessible;

            return (
              <Link
                key={moduleNo}
                href={canAccess ? `/modules/${moduleNo}` : "#"}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all"
                style={{
                  background: "var(--dc-bg-secondary)",
                  borderColor: isCompleted ? "rgba(35,165,89,0.3)"
                    : status === "ongoing" ? "rgba(240,177,50,0.2)"
                    : "var(--dc-border)",
                  cursor: canAccess ? "pointer" : "default",
                  opacity: !isUnlocked ? 0.6 : 1,
                }}
                onMouseEnter={e => {
                  if (canAccess) (e.currentTarget as HTMLElement).style.borderColor = "rgba(88,101,242,0.4)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = isCompleted
                    ? "rgba(35,165,89,0.3)"
                    : status === "ongoing" ? "rgba(240,177,50,0.2)"
                    : "var(--dc-border)";
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                  style={{
                    background: isCompleted ? "rgba(35,165,89,0.15)"
                      : status === "ongoing" ? "rgba(240,177,50,0.15)"
                      : canAccess ? "rgba(88,101,242,0.15)"
                      : "rgba(255,255,255,0.05)",
                    color: isCompleted ? "var(--dc-green)"
                      : status === "ongoing" ? "var(--dc-yellow)"
                      : canAccess ? "var(--dc-blurple)"
                      : "var(--dc-text-muted)",
                  }}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : moduleNo}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">
                    {MODULE_NAMES[moduleNo] ?? `Module ${moduleNo}`}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--dc-text-muted)" }}>
                    {!isUnlocked && info?.unlockedAt
                      ? `Unlocks ${new Date(info.unlockedAt).toLocaleDateString()}`
                      : !isAccessible && isUnlocked
                      ? `Complete Module ${moduleNo - 1} first`
                      : MODULE_DESCRIPTIONS[moduleNo]}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={status} accessible={isAccessible} unlocked={isUnlocked} />
                  {canAccess && <ChevronRight className="w-4 h-4" style={{ color: "var(--dc-text-muted)" }} />}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
