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
import {
  BookOpen,
  Trophy,
  Layers,
  TrendingUp,
  Brain,
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

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
    return <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--dc-green)" }} />;
  }
  if (status === "ongoing") {
    return <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--dc-yellow)" }} />;
  }
  if (!accessible) {
    return <Lock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--dc-text-muted)" }} />;
  }
  return <Circle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--dc-text-muted)" }} />;
}

function StatCard({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <p className="text-xs font-medium" style={{ color: "var(--dc-text-muted)" }}>{label}</p>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
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

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--dc-bg-primary)" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full animate-pulse mx-auto mb-3" style={{ background: "var(--dc-blurple)" }} />
          <p className="text-sm" style={{ color: "var(--dc-text-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }



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

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-5" style={{ color: "var(--dc-text-normal)" }}>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm mb-0.5" style={{ color: "var(--dc-text-muted)" }}>Welcome back!</p>
          <h1 className="text-2xl font-bold text-white">{selectedChild.name}</h1>
        </div>
        <Link
          href="/modules"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80"
          style={{ background: "var(--dc-blurple)" }}
        >
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </div>



      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Modules" value={`${dashboardData?.progress?.modules.completed ?? 0}/${dashboardData?.progress?.modules.total ?? 0}`} color="var(--dc-green)" icon={Layers} />
        <StatCard label="Quests" value={`${dashboardData?.progress?.quests.completed ?? 0}/${dashboardData?.progress?.quests.total ?? 0}`} color="#c084fc" icon={Trophy} />
        <StatCard label="Screens" value={`${dashboardData?.progress?.screens.completed ?? 0}/${dashboardData?.progress?.screens.total ?? 0}`} color="var(--dc-blurple)" icon={BookOpen} />
        <StatCard label="Overall" value={`${dashboardData?.progress?.screenProgressPercentage ?? 0}%`} color="var(--dc-yellow)" icon={TrendingUp} />
      </div>

      {/* Brain type */}
      {dashboardData?.brain_data.status === "completed" ? (
        <div className="rounded-xl p-5 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #4752c4 0%, #5865f2 100%)" }}>
          <span className="text-4xl">{BRAIN_ICONS[dashboardData.brain_data.type] ?? "🧠"}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5 text-indigo-200">Your Brain Type</p>
            <p className="text-lg font-bold text-white">{dashboardData.brain_data.type}</p>
            <div className="flex gap-3 mt-1 text-xs text-indigo-200">
              {(["A", "B", "C", "D"] as const).map((l) => (
                <span key={l}>{l}: {dashboardData.brain_data.counts[l]}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-4 flex items-center gap-3 border"
          style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
          <Brain className="w-8 h-8 flex-shrink-0" style={{ color: "var(--dc-text-muted)" }} />
          <div>
            <p className="font-semibold text-white text-sm">Brain Type Unknown</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--dc-text-muted)" }}>
              Complete Module 1 → Quest 5 → Screen 2 to reveal your brain type
            </p>
          </div>
        </div>
      )}

      {/* Module progress */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--dc-border)" }}>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" style={{ color: "var(--dc-green)" }} />
            <h2 className="font-semibold text-white text-sm">Module Progress</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(35,165,89,0.15)", color: "var(--dc-green)" }}>
            {completedModules}/{totalModules}
          </span>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--dc-border)" }}>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--dc-bg-tertiary)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${dashboardData?.progress?.screenProgressPercentage ?? 0}%`,
                background: "var(--dc-green)",
              }}
            />
          </div>
        </div>

        <ul>
          {(dashboardData?.module_progress ?? Array.from({ length: 6 }, (_, i) => ({
            module: i + 1,
            status: "initialized" as const,
            accessible: false,
            unlocked: false,
            unlockedAt: null,
            isCompleted: false,
            completedAt: null,
          }))).map((m: any, idx: any, arr: any) => {
            const canNavigate = m.unlocked && m.accessible;
            const name = MODULE_NAMES[m.module] ?? `Module ${m.module}`;
            const isLast = idx === arr.length - 1;

            return (
              <li key={m.module} className={!isLast ? "border-b" : ""} style={{ borderColor: "var(--dc-border-subtle)" }}>
                <Link
                  href={canNavigate ? `/modules/${m.module}` : "#"}
                  className="flex items-center gap-3 px-5 py-3 transition-colors"
                  style={{
                    cursor: canNavigate ? "pointer" : "default",
                  }}
                  onMouseEnter={e => {
                    if (canNavigate) (e.currentTarget as HTMLElement).style.background = "var(--dc-bg-modifier-hover)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <ModuleStatusIcon status={m.status} accessible={m.accessible} />
                  <span
                    className="text-sm font-medium flex-1"
                    style={{
                      color: m.status === "completed" ? "white"
                        : m.status === "ongoing" ? "var(--dc-yellow)"
                          : !m.unlocked ? "var(--dc-text-muted)"
                            : "var(--dc-text-normal)",
                    }}
                  >
                    {name}
                  </span>
                  {!m.unlocked && m.unlockedAt && (
                    <span className="text-xs" style={{ color: "var(--dc-text-muted)" }}>
                      {new Date(m.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                  {canNavigate && <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--dc-text-muted)" }} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
