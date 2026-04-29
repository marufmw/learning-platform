import { useState, useEffect } from "react";
import instance from "./axios-instance";
import { moduleRegistry } from "@/lib/module-registry";

interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: string | null;
}

function useQuery<T>(
  queryKey: string[] | null,
  queryFn: () => Promise<T>,
  options?: { skip?: boolean }
): UseQueryResult<T> {
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (options?.skip) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!options?.skip) {
      refetch();
    }
  }, [options?.skip, queryKey ? JSON.stringify(queryKey) : null]);

  return { data, isLoading, error, refetch };
}

function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
): UseMutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      return result;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || "Unknown error";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

// Health
export function useGetHealthQuery(
  _?: undefined,
  options?: { skip?: boolean }
): UseQueryResult<{ status: string; timestamp: string }> {
  return useQuery(
    ["health"],
    () => instance.get("/health").then((res) => res.data),
    options
  );
}

// Users
export function useGetMeQuery(
  _?: undefined,
  options?: { skip?: boolean }
): UseQueryResult<any> {
  return useQuery(
    ["me"],
    () => instance.get("/users/me").then((res) => res.data),
    options
  );
}

export function useUpdateUserMutation(): UseMutationResult<
  any,
  {
    name?: string;
    phoneNumber?: string;
    country?: string;
    state?: string;
    timezone?: string;
    age?: number;
    zipcode?: string;
    profileImage?: File;
  }
> {
  return useMutation(({ profileImage, ...fields }) => {
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") form.append(k, String(v));
    });
    if (profileImage) form.append("profileImage", profileImage);
    return instance
      .patch("/users/me", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((res) => res.data);
  });
}

export function useUpdatePasswordMutation(): UseMutationResult<
  any,
  { currentPassword?: string; newPassword: string }
> {
  return useMutation(({ currentPassword, newPassword }) =>
    instance.patch("/users/me/password", { currentPassword, newPassword }).then((res) => res.data)
  );
}

// Module Registry
export function useGetModuleRegistryQuery(
  _?: undefined,
  options?: { skip?: boolean }
): UseQueryResult<any> {
  return useQuery(
    ["module-registry"],
    () => Promise.resolve(moduleRegistry),
    options
  );
}

// Payments
export function useStartTrialMutation(): UseMutationResult<any, void> {
  return useMutation(() =>
    instance.post("/payment/start-trial").then((res) => res.data)
  );
}

export function useStartPlanMutation(): UseMutationResult<any, { planName: string }> {
  return useMutation(({ planName }) =>
    instance.post("/payment/start-plan", { planName }).then((res) => res.data)
  );
}

export function useGetPaymentHistoryQuery(
  _?: undefined,
  options?: { skip?: boolean }
): UseQueryResult<any[]> {
  return useQuery(
    ["payment-history"],
    () => instance.get("/payment/history").then((res) => res.data),
    options
  );
}

// Children
export function useGetChildrenQuery(
  _?: undefined,
  options?: { skip?: boolean }
): UseQueryResult<any[]> {
  return useQuery(
    ["children"],
    () => instance.get("/children").then((res) => res.data),
    options
  );
}

export function useCreateChildMutation(): UseMutationResult<
  any,
  { name: string; age: number; gender: string }
> {
  return useMutation(({ name, age, gender }) =>
    instance
      .post("/children", { name, age, gender })
      .then((res) => res.data)
  );
}

export function useUpdateChildMutation(): UseMutationResult<
  any,
  { id: string; name?: string; age?: number; gender?: string }
> {
  return useMutation(({ id, ...body }) =>
    instance.patch(`/children/${id}`, body).then((res) => res.data)
  );
}

// Access Status
export function useGetAccessStatusQuery(
  params: { childId?: string; module?: number; quest?: number; screen?: number } | undefined,
  options?: { skip?: boolean }
): UseQueryResult<any> {
  return useQuery(
    params ? ["access-status", JSON.stringify(params)] : null,
    () =>
      instance
        .get("/modules/get-access-status", { params })
        .then((res) => res.data),
    { skip: !params || options?.skip }
  );
}

// Access List
import type { AccessListResponse } from "./access-list";

export function useGetAccessListQuery(
  params: { childId: string; include?: string[] } | undefined,
  options?: { skip?: boolean }
): UseQueryResult<AccessListResponse> {
  return useQuery(
    params ? ["access-list", params.childId, ...(params.include ?? [])] : null,
    () =>
      instance
        .get("/modules/access-list", {
          params: {
            childId: params!.childId,
            ...(params?.include?.length
              ? { include: params.include.join(",") }
              : {}),
          },
        })
        .then((res) => res.data),
    { skip: !params || options?.skip }
  );
}


// Progress
export function useSaveScreenMutation(): UseMutationResult<
  any,
  {
    childId: string;
    moduleNo: number;
    questNo: number;
    screenNo: number;
    isCompleted: boolean;
    data?: Record<string, unknown>;
  }
> {
  return useMutation(({ childId, moduleNo, questNo, screenNo, ...body }) =>
    instance
      .post(`/children/${childId}/progress/${moduleNo}/${questNo}/${screenNo}`, body)
      .then((res) => res.data)
  );
}

// Dashboard
export function useGetChildDashboardQuery(
  params: { childId: string; include?: string[] } | undefined,
  options?: { skip?: boolean }
): UseQueryResult<{
  brain_data: {
    status: "completed" | "pending";
    type: string;
    answers: Record<string, number>;
    counts: { A: number; B: number; C: number; D: number };
  };
  progress: {
    modules: { completed: number; total: number };
    quests: { completed: number; total: number };
    screens: { completed: number; total: number };
    progressPercentage: number;
  };
  module_progress: {
    module: number;
    status: "initialized" | "ongoing" | "completed";
    accessible: boolean;
    unlocked: boolean;
    unlockedAt: string | null;
  }[];
  quest_progress?: {
    module: number;
    quest: number;
    status: "initialized" | "ongoing" | "completed";
    accessible: boolean;
    unlocked: boolean;
    unlockedAt: string | null;
  }[];
  screen_progress?: {
    module: number;
    quest: number;
    screen: number;
    status: "initialized" | "ongoing" | "completed";
    accessible: boolean;
    unlocked: boolean;
    unlockedAt: string | null;
  }[];
}> {
  return useQuery(
    params ? ["child-dashboard", params.childId, ...(params.include ?? [])] : null,
    () =>
      instance
        .get(`/dashboard/${params!.childId}`, {
          params: params?.include?.length
            ? { include: params.include.join(",") }
            : undefined,
        })
        .then((res) => res.data),
    { skip: !params || options?.skip }
  );
}

export function useGetScreenQuery(
  params:
    | { childId: string; moduleNo: number; questNo: number; screenNo: number }
    | undefined,
  options?: { skip?: boolean }
): UseQueryResult<any> {
  return useQuery(
    params
      ? ["screen", params.childId, String(params.moduleNo), String(params.questNo), String(params.screenNo)]
      : null,
    () => {
      if (!params) throw new Error("Missing params");
      return instance
        .get(
          `/children/${params.childId}/progress/${params.moduleNo}/${params.questNo}/${params.screenNo}`
        )
        .then((res) => res.data);
    },
    { skip: !params || options?.skip }
  );
}
