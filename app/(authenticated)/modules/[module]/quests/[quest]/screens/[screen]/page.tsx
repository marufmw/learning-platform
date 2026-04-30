"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const QUIZ_QUESTION_COUNT = 5;
const OPTION_LABELS = ["A", "B", "C", "D", "E"];

type Answers = Record<string, number>;

function quizKey(moduleNo: number, questNo: number, screenNo: number) {
  return `module_${moduleNo}_quest_${questNo}_screen_${screenNo}_quiz_answers`;
}

function buildPayload(
  answers: Answers,
  key: string,
  extra: Record<string, unknown>,
): Record<string, unknown> {
  return { [key]: answers, ...extra };
}

export default function ScreenPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded } = useAuth();

  const moduleNo = parseInt(params.module as string);
  const questNo = parseInt(params.quest as string);
  const screenNo = parseInt(params.screen as string);
  const { selectedChildId: childId } = useSelectedChild();

  const key = quizKey(moduleNo, questNo, screenNo);
  const [answers, setAnswers] = useState<Answers>({});
  const [extra, setExtra] = useState<Record<string, unknown>>({});
  const [devOpen, setDevOpen] = useState(false);
  const [devText, setDevText] = useState("{}");
  const [devError, setDevError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);

  const { data: registry } = useGetModuleRegistryQuery(undefined, { skip: !isLoaded || !childId });
  const { data: accessStatus, refetch: refetchAccessStatus } = useGetAccessStatusQuery(
    childId && isLoaded ? { childId, module: moduleNo, quest: questNo, screen: screenNo } : undefined,
    { skip: !childId || !isLoaded }
  );

  const screenStatus =
    accessStatus?.[`module_${moduleNo}`]?.[`quest_${questNo}`]?.[`screen_${screenNo}`];

  let validationError = "";
  if (registry && childId) {
    const mod = registry?.perModule?.[moduleNo];
    if (!mod) validationError = "Module not found";
    else if (mod.quests[questNo] === undefined) validationError = "Quest not found";
    else if (screenNo < 1 || screenNo > mod.quests[questNo].screens) validationError = "Screen not found";
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

  const syncDevText = useCallback(
    (a: Answers, e: Record<string, unknown>) => {
      setDevText(JSON.stringify(buildPayload(a, key, e), null, 2));
    },
    [key]
  );

  useEffect(() => {
    if (screenData) {
      const data: Record<string, unknown> = screenData.data ?? {};
      const savedAnswers: Answers = (data[key] as Answers) ?? {};
      const { [key]: _, ...rest } = data;
      setAnswers(savedAnswers);
      setExtra(rest);
      setDevText(JSON.stringify(data, null, 2));
    } else if (isLoaded && accessStatus && !isLoading) {
      setAnswers({});
      setExtra({});
      setDevText("{}");
    }
    setDataLoaded(true);
  }, [screenData, isLoading, isLoaded, accessStatus, key]);

  const handleAnswerSelect = (questionIdx: number, value: number) => {
    const next = { ...answers, [String(questionIdx)]: value };
    setAnswers(next);
    syncDevText(next, extra);
  };

  const handleDevChange = (text: string) => {
    setDevText(text);
    setDevError("");
    try {
      const parsed: Record<string, unknown> = JSON.parse(text);
      const savedAnswers: Answers = (parsed[key] as Answers) ?? {};
      const { [key]: _, ...rest } = parsed;
      setAnswers(savedAnswers);
      setExtra(rest);
    } catch {
      setDevError("Invalid JSON");
    }
  };

  const handleSave = async () => {
    if (!childId || !registry) return;
    if (devError) return;

    let dataToSubmit: Record<string, unknown>;
    try {
      dataToSubmit = JSON.parse(devText);
    } catch {
      setSaveError("Fix the JSON in the dev panel before saving.");
      return;
    }

    try {
      setSaveError("");
      await saveScreen({ childId, moduleNo, questNo, screenNo, isCompleted: true, data: dataToSubmit });
      await refetchAccessStatus();

      const mod = registry?.perModule?.[moduleNo];
      const questScreens = mod?.quests?.[questNo]?.screens || 0;
      const nextScreenNo = screenNo + 1;

      if (nextScreenNo <= questScreens) {
        router.push(`/modules/${moduleNo}/quests/${questNo}/screens/${nextScreenNo}`);
      } else {
        const questNos = Object.keys(mod?.quests || {}).map(Number).sort((a, b) => a - b);
        const nextQuestIndex = questNos.indexOf(questNo) + 1;
        if (nextQuestIndex < questNos.length) {
          router.push(`/modules/${moduleNo}/quests/${questNos[nextQuestIndex]}/screens/1`);
        } else {
          router.push(`/modules/${moduleNo}`);
        }
      }
    } catch (err: any) {
      setSaveError(err.data?.message || "Failed to save progress");
    }
  };

  if (validationError) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4" style={{ color: "var(--dc-text-normal)" }}>
        <div className="text-center max-w-sm">
          <Lock className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--dc-text-muted)" }} />
          <p className="text-white font-semibold mb-2">{validationError}</p>
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm hover:underline mt-1" style={{ color: "var(--dc-blurple)" }}>
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
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm mb-2 hover:underline" style={{ color: "var(--dc-blurple)" }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-xs mb-0.5" style={{ color: "var(--dc-text-muted)" }}>
          Module {moduleNo} › Quest {questNo}
        </p>
        <h1 className="text-2xl font-bold text-white">Screen {screenNo}</h1>
      </div>

      {saveError && (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5 border"
          style={{ background: "rgba(242,63,66,0.08)", borderColor: "rgba(242,63,66,0.25)" }}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dc-red)" }} />
          <p className="text-sm" style={{ color: "var(--dc-red)" }}>{saveError}</p>
        </div>
      )}

      {/* Quiz questions */}
      <div className="space-y-4 mb-5">
        {Array.from({ length: QUIZ_QUESTION_COUNT }, (_, i) => (
          <div key={i} className="rounded-xl border overflow-hidden"
            style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--dc-border)" }}>
              <p className="text-sm font-semibold text-white">Question {i + 1}</p>
            </div>
            <div className="p-3 grid grid-cols-5 gap-2">
              {OPTION_LABELS.map((label, optIdx) => {
                const value = optIdx + 1;
                const selected = answers[String(i)] === value;
                return (
                  <button
                    key={label}
                    onClick={() => handleAnswerSelect(i, value)}
                    className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-sm font-bold transition-all"
                    style={{
                      background: selected ? "var(--dc-blurple)" : "var(--dc-bg-modifier-hover)",
                      color: selected ? "white" : "var(--dc-text-muted)",
                      border: `1px solid ${selected ? "var(--dc-blurple)" : "transparent"}`,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dev panel */}
      <div className="rounded-xl border mb-5 overflow-hidden"
        style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
        <button
          onClick={() => setDevOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
          style={{ borderBottom: devOpen ? "1px solid var(--dc-border)" : "none" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dc-text-muted)" }}>Dev Panel</span>
            {devError && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(242,63,66,0.15)", color: "var(--dc-red)" }}>Invalid JSON</span>}
          </div>
          {devOpen
            ? <ChevronUp className="w-4 h-4" style={{ color: "var(--dc-text-muted)" }} />
            : <ChevronDown className="w-4 h-4" style={{ color: "var(--dc-text-muted)" }} />
          }
        </button>

        {devOpen && (
          <textarea
            value={devText}
            onChange={e => handleDevChange(e.target.value)}
            className="w-full h-64 p-4 font-mono text-xs resize-none outline-none"
            style={{ background: "var(--dc-bg-primary)", color: "var(--dc-text-normal)" }}
            spellCheck={false}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving || !!devError}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: "var(--dc-blurple)" }}
        >
          {isSaving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
          ) : (
            <><Save className="w-4 h-4" />Save & Next<ArrowRight className="w-4 h-4" /></>
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
