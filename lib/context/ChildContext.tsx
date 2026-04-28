"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ChildContextType {
  selectedChildId: string | null;
  setSelectedChild: (childId: string | null) => void;
}

const ChildContext = createContext<ChildContextType>({
  selectedChildId: null,
  setSelectedChild: () => {},
});

export function ChildProvider({ children }: { children: ReactNode }) {
  const [selectedChildId, setSelectedChildIdState] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("selectedChildId");
    setSelectedChildIdState(saved || null);
  }, []);

  const setSelectedChild = (childId: string | null) => {
    setSelectedChildIdState(childId);
    if (childId) {
      localStorage.setItem("selectedChildId", childId);
    } else {
      localStorage.removeItem("selectedChildId");
    }
    // Dispatch custom event so other components know to refetch
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("childSelectionChanged", { detail: { childId } })
      );
    }
  };

  return (
    <ChildContext.Provider value={{ selectedChildId, setSelectedChild }}>
      {children}
    </ChildContext.Provider>
  );
}

export function useSelectedChild() {
  const context = useContext(ChildContext);
  return context;
}
