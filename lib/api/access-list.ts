export type AccessListItem = {
  module: number;
  quest?: number;
  screen?: number;
  status: "initialized" | "ongoing" | "completed";
  accessible: boolean;
  unlocked: boolean;
  unlockedAt: string | null;
  isCompleted: boolean;
  completedAt: string | null;
};

export type AccessListResponse = {
  module_list: AccessListItem[];
  quest_list?: AccessListItem[];
  screen_list?: AccessListItem[];
};

export function getAccessInfo(
  type: "module",
  accessList: AccessListResponse | undefined,
  moduleNo: number,
): AccessListItem | null;
export function getAccessInfo(
  type: "quest",
  accessList: AccessListResponse | undefined,
  moduleNo: number,
  questNo: number,
): AccessListItem | null;
export function getAccessInfo(
  type: "screen",
  accessList: AccessListResponse | undefined,
  moduleNo: number,
  questNo: number,
  screenNo: number,
): AccessListItem | null;
export function getAccessInfo(
  type: "module" | "quest" | "screen",
  accessList: AccessListResponse | undefined,
  moduleNo: number,
  questNo?: number,
  screenNo?: number,
): AccessListItem | null {
  if (!accessList) return null;
  switch (type) {
    case "module":
      return accessList.module_list.find((m) => m.module === moduleNo) ?? null;
    case "quest":
      return (
        accessList.quest_list?.find(
          (q) => q.module === moduleNo && q.quest === questNo,
        ) ?? null
      );
    case "screen":
      return (
        accessList.screen_list?.find(
          (s) =>
            s.module === moduleNo &&
            s.quest === questNo &&
            s.screen === screenNo,
        ) ?? null
      );
  }
}
