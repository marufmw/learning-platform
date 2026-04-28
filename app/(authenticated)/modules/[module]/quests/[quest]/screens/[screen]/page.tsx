"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  useGetScreenQuery,
  useSaveScreenMutation,
  useGetModuleRegistryQuery,
  useGetAccessHierarchyQuery,
} from "@/lib/api/hooks";
import { useSelectedChild } from "@/lib/context/ChildContext";

export default function ScreenPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded } = useAuth();

  const moduleNo = parseInt(params.module as string);
  const questNo = parseInt(params.quest as string);
  const screenNo = parseInt(params.screen as string);
  const { selectedChildId: childId } = useSelectedChild();

  const [jsonData, setJsonData] = useState<Record<string, unknown>>({});
  const [rawJsonText, setRawJsonText] = useState("{}");
  const [error, setError] = useState("");

  const { data: registry } = useGetModuleRegistryQuery(undefined, {
    skip: !isLoaded || !childId,
  });

  const { data: accessStatus } = useGetAccessHierarchyQuery(
    childId && isLoaded ? { childId } : undefined,
    { skip: !childId || !isLoaded }
  );

  // Calculate validation error synchronously
  let validationError = "";
  if (registry && accessStatus && childId) {
    const module = registry?.perModule?.[moduleNo];

    if (!module) {
      validationError = "Module not found";
    } else {
      // Check if module is unlocked and accessible
      const moduleStatus = accessStatus?.[`module_${moduleNo}`];
      if (!moduleStatus?.unlocked) {
        if (moduleStatus?.unlockDate) {
          const unlockDate = new Date(moduleStatus.unlockDate).toLocaleDateString();
          validationError = `Module is locked. Unlocks on ${unlockDate}`;
        } else {
          validationError = `Module is locked`;
        }
      } else if (!moduleStatus?.accessible) {
        validationError = `Module is inaccessible. Complete previous modules first.`;
      } else {
        const questScreenCount = module?.quests?.[questNo]?.screens;

        if (questScreenCount === undefined) {
          validationError = "Quest not found";
        } else if (screenNo > questScreenCount || screenNo < 1) {
          validationError = "Screen not found";
        } else {
          // Check if quest is accessible
          const questStatus = accessStatus?.[`module_${moduleNo}`]?.quests?.[`quest_${questNo}`];
          if (!questStatus?.accessible) {
            if (questStatus?.unlockDate) {
              const unlockDate = new Date(questStatus.unlockDate).toLocaleDateString();
              validationError = `Quest is locked. Unlocks on ${unlockDate}`;
            } else {
              validationError = "Quest is inaccessible. Complete previous quests first.";
            }
          } else {
            // Check if screen is accessible
            const screenStatus = accessStatus?.[`module_${moduleNo}`]?.quests?.[`quest_${questNo}`]?.screens?.[`screen_${screenNo}`];
            if (!screenStatus?.accessible) {
              if (screenStatus?.unlockDate) {
                const unlockDate = new Date(screenStatus.unlockDate).toLocaleDateString();
                validationError = `Screen is locked. Unlocks on ${unlockDate}`;
              } else {
                validationError = "Screen is inaccessible. Complete previous screens first.";
              }
            }
          }
        }
      }
    }
  }

  const { data: screenData, isLoading } = useGetScreenQuery(
    childId && isLoaded && accessStatus && !validationError
      ? { childId, moduleNo, questNo, screenNo }
      : undefined,
    { skip: !childId || !isLoaded || !accessStatus || !!validationError }
  );

  const { mutate: saveScreen, isLoading: isSaving } = useSaveScreenMutation();
  const { refetch: refetchAccessHierarchy } = useGetAccessHierarchyQuery(
    childId && isLoaded ? { childId } : undefined,
    { skip: !childId || !isLoaded }
  );
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load existing data or initialize empty
  useEffect(() => {
    if (screenData) {
      // Existing progress found
      const data = screenData.data ?? {};
      setJsonData(data);
      setRawJsonText(JSON.stringify(data, null, 2));
    } else if (isLoaded && accessStatus && !isLoading) {
      // No existing progress, initialize with empty data
      setJsonData({});
      setRawJsonText("{}");
    }
    setDataLoaded(true);
  }, [screenData, isLoading, isLoaded, accessStatus]);

  const handleSave = async () => {
    if (!childId || !registry) return;

    try {
      setError("");

      // Validate JSON before submitting
      let dataToSubmit: Record<string, unknown> = {};
      const textContent = rawJsonText.trim();

      if (textContent) {
        try {
          dataToSubmit = JSON.parse(textContent);
        } catch (err) {
          setError("Invalid JSON format. Please fix the JSON before saving.");
          return;
        }
      }

      await saveScreen({
        childId,
        moduleNo,
        questNo,
        screenNo,
        isCompleted: true,
        data: dataToSubmit,
      });

      // Refetch access hierarchy to get updated completion status
      await refetchAccessHierarchy();

      // Navigate to next screen
      const module = registry?.perModule?.[moduleNo];
      const questScreens = module?.quests?.[questNo]?.screens || 0;
      const nextScreenNo = screenNo + 1;

      if (nextScreenNo <= questScreens) {
        // More screens in this quest
        router.push(
          `/modules/${moduleNo}/quests/${questNo}/screens/${nextScreenNo}`
        );
      } else {
        // Check if there's a next quest
        const questNos = Object.keys(module?.quests || {}).map(Number).sort((a, b) => a - b);
        const nextQuestIndex = questNos.indexOf(questNo) + 1;

        if (nextQuestIndex < questNos.length) {
          // Go to first screen of next quest
          const nextQuestNo = questNos[nextQuestIndex];
          router.push(
            `/modules/${moduleNo}/quests/${nextQuestNo}/screens/1`
          );
        } else {
          // Quest complete, go back to module
          router.push(`/modules/${moduleNo}`);
        }
      }
    } catch (err: any) {
      setError(err.data?.message || "Failed to save progress");
    }
  };

  if (validationError) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-6 border border-red-200 dark:border-red-900">
            {validationError}
          </div>
          <button
            onClick={() => router.back()}
            className="bg-gray-500 dark:bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-600 transition"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!childId) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">No child selected</p>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading screen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Module {moduleNo} → Quest {questNo}
            </p>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Screen {screenNo}
            </h1>
          </div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-6 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            📝 Screen Data (JSON)
          </h2>
          <textarea
            value={rawJsonText}
            onChange={(e) => setRawJsonText(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder='Enter JSON data or leave empty for {}'
          />
        </div>


        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !!error}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg disabled:opacity-50 transition font-medium"
          >
            {isSaving ? "Saving..." : "Save & Next →"}
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
