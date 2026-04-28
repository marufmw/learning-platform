import { useEffect } from "react";
import { useSelectedChild } from "@/lib/context/ChildContext";

export function useChildRefetch(refetch: () => void) {
  const { selectedChildId } = useSelectedChild();

  useEffect(() => {
    refetch();
  }, [selectedChildId, refetch]);

  useEffect(() => {
    const handleChildChanged = () => {
      refetch();
    };

    window.addEventListener("childSelectionChanged", handleChildChanged);
    return () => {
      window.removeEventListener("childSelectionChanged", handleChildChanged);
    };
  }, [refetch]);
}
