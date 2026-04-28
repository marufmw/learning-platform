import { useState, useEffect } from "react";

export function useSelectedChild(defaultChildId?: string) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedChildId");
    setSelectedChildId(saved || defaultChildId || null);
    setIsLoaded(true);
  }, [defaultChildId]);

  const updateSelectedChild = (childId: string | null) => {
    setSelectedChildId(childId);
    if (childId) {
      localStorage.setItem("selectedChildId", childId);
    } else {
      localStorage.removeItem("selectedChildId");
    }
  };

  return { selectedChildId, setSelectedChild: updateSelectedChild, isLoaded };
}
