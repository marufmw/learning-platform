"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  useGetScreenQuery,
  useSaveScreenMutation,
  useGetModuleRegistryQuery,
  useGetAccessStatusQuery,
} from "@/lib/api/hooks";
import { useSelectedChild } from "@/lib/context/ChildContext";
import {
  ChevronLeft,
  Lock,
  ArrowRight,
  AlertCircle,
  Save,
  FileJson,
} from "lucide-react";

export default function ScreenPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded } = useAuth();

  const moduleNo = parseInt(params.module as string);
  const questNo = parseInt(params.quest as string);
  const screenNo = parseInt(params.screen as string);
  const { selectedChildId: childId } = useSelectedChild();

  const [rawJsonText, setRawJsonText] = useState("{}");
  const [error, setError] = useState("");

  const { data: registry } = useGetModuleRegistryQuery(undefined, {
    skip: !isLoaded || !childId,
  });

  const { data: accessStatus, refetch: refetchAccessStatus } = useGetAccessStatusQuery(
    childId && isLoaded
      ? { childId, module: moduleNo, quest: questNo, screen: screenNo }
      : undefined,
    { skip: !childId || !isLoaded }
  );

  const screenStatus =
    accessStatus?.[`module_${moduleNo}`]?.[`quest_${questNo}`]?.[`screen_${screenNo}`];

  let validationError = "";
  if (registry && childId) {
    const mod = registry?.perModule?.[moduleNo];
    if (!mod) {
      validationError = "Module not found";
    } else if (mod.quests[questNo] === undefined) {
      validationError = "Quest not found";
    } else if (screenNo < 1 || screenNo > mod.quests[questNo].screens) {
      validationError = "Screen not found";
    }
  }
  if (!validationError && accessStatus && screenStatus) {
    if (!screenStatus.unlocked) {
      validationError = screenStatus.unlockDate
        ? `Locked — unlocks on ${new Date(screenStatus.unlockDate).toLocaleDateString()}`
        : "Content is locked. Purchase a plan to unlock.";
    } else if (!screenStatus.accessible) {
      validationError = "Complete previous content first.";
    }
  }

  const { data: screenData, isLoading } = useGetScreenQuery(
    childId && isLoaded && accessStatus && !validationError
      ? { childId, moduleNo, questNo, screenNo }
      : undefined,
    { skip: !childId || !isLoaded || !accessStatus || !!validationError }
  );

  const { mutate: saveScreen, isLoading: isSaving } = useSaveScreenMutation();
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (screenData) {
      const data = screenData.data ?? {};
      setRawJsonText(JSON.stringify(data, null, 2));
    } else if (isLoaded && accessStatus && !isLoading) {
      setRawJsonText("{}");
    }
    setDataLoaded(true);
  }, [screenData, isLoading, isLoaded, accessStatus]);

  const handleSave = async () => {
    if (!childId || !registry) return;
    try {
      setError("");
      let dataToSubmit: Record<string, unknown> = {};
      const textContent = rawJsonText.trim();
      if (textContent) {
        try {
          dataToSubmit = JSON.parse(textContent);
        } catch {
          setError("Invalid JSON format. Please fix the JSON before saving.");
          return;
        }
      }

      await saveScreen({ childId, moduleNo, questNo, screenNo, isCompleted: true, data: dataToSubmit });
      await refetchAccessStatus();

      const module = registry?.perModule?.[moduleNo];
      const questScreens = module?.quests?.[questNo]?.screens || 0;
      const nextScreenNo = screenNo + 1;

      if (nextScreenNo <= questScreens) {
        router.push(`/modules/${moduleNo}/quests/${questNo}/screens/${nextScreenNo}`);
      } else {
        const questNos = Object.keys(module?.quests || {}).map(Number).sort((a, b) => a - b);
        const nextQuestIndex = questNos.indexOf(questNo) + 1;
        if (nextQuestIndex < questNos.length) {
          router.push(`/modules/${moduleNo}/quests/${questNos[nextQuestIndex]}/screens/1`);
        } else {
          router.push(`/modules/${moduleNo}`);
        }
      }
    } catch (err: any) {
      setError(err.data?.message || "Failed to save progress");
    }
  };

  if (validationError) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4" style={{ color: "var(--dc-text-normal)" }}>
        <div className="text-center max-w-sm">
          <Lock className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--dc-text-muted)" }} />
          <p className="text-white font-semibold mb-2">{validationError}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm hover:underline mt-1"
            style={{ color: "var(--dc-blurple)" }}
          >
            <ChevronLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!childId) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: "var(--dc-text-muted)" }}>
        <p className="text-sm">No child selected</p>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full animate-pulse mx-auto mb-3" style={{ background: "var(--dc-blurple)" }} />
          <p className="text-sm" style={{ color: "var(--dc-text-muted)" }}>Loading screen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-3xl mx-auto" style={{ color: "var(--dc-text-normal)" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm mb-2 hover:underline"
            style={{ color: "var(--dc-blurple)" }}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <p className="text-xs mb-0.5" style={{ color: "var(--dc-text-muted)" }}>
            Module {moduleNo} › Quest {questNo}
          </p>
          <h1 className="text-2xl font-bold text-white">Screen {screenNo}</h1>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5 border"
          style={{ background: "rgba(242,63,66,0.08)", borderColor: "rgba(242,63,66,0.25)" }}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dc-red)" }} />
          <p className="text-sm" style={{ color: "var(--dc-red)" }}>{error}</p>
        </div>
      )}

      <div className="rounded-xl border mb-5 overflow-hidden"
        style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
        <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: "var(--dc-border)" }}>
          <FileJson className="w-4 h-4" style={{ color: "var(--dc-blurple)" }} />
          <h2 className="text-sm font-semibold text-white">Screen Data</h2>
          <span className="text-xs ml-auto" style={{ color: "var(--dc-text-muted)" }}>JSON</span>
        </div>
        <textarea
          value={rawJsonText}
          onChange={(e) => {
            setRawJsonText(e.target.value);
            setError("");
          }}
          className="w-full h-64 p-4 font-mono text-sm resize-none outline-none"
          style={{
            background: "var(--dc-bg-secondary)",
            color: "var(--dc-text-normal)",
            border: "none",
          }}
          placeholder="{}"
          spellCheck={false}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving || !!error}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: "var(--dc-blurple)" }}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save & Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: "var(--dc-bg-modifier-hover)", color: "var(--dc-text-normal)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--dc-bg-modifier-active)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--dc-bg-modifier-hover)")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
