/**
 * Backward-compatible hook wrappers backed by RTK Query.
 *
 * All query hooks return { data, isLoading, error, refetch } and all mutation
 * hooks return { mutate, isLoading, error } — the same shapes used throughout
 * the app — so consumer files need no changes.
 *
 * Cache invalidation is handled automatically via providesTags / invalidatesTags
 * defined in apiSlice.ts.
 */

import { apiSlice } from "./apiSlice";
import type { AccessListResponse } from "./access-list";

export type { AccessListResponse } from "./access-list";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toErrMsg(e: unknown): string | null {
  if (!e) return null;
  const err = e as any;
  return err?.data?.message ?? err?.data ?? String(e);
}

/** Wraps an RTK Query refetch so callers can safely await it. */
function wrapRefetch(refetch: () => unknown): () => Promise<void> {
  return async () => { refetch(); };
}

/** Wraps an RTK Query mutation tuple into the legacy { mutate, isLoading, error } shape. */
function wrapMutation<TData, TArg>(
  trigger: (arg: TArg) => { unwrap: () => Promise<TData> },
  result: { isLoading: boolean; error?: unknown },
) {
  return {
    mutate: (arg: TArg): Promise<TData> => trigger(arg).unwrap(),
    isLoading: result.isLoading,
    error: toErrMsg(result.error),
  };
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export function useGetHealthQuery(
  _?: undefined,
  options?: { skip?: boolean },
) {
  const r = apiSlice.useGetHealthQuery(undefined, { skip: options?.skip });
  return { data: r.data, isLoading: r.isLoading, error: toErrMsg(r.error), refetch: wrapRefetch(r.refetch) };
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export function useGetMeQuery(_?: undefined, options?: { skip?: boolean }) {
  const r = apiSlice.useGetMeQuery(undefined, { skip: options?.skip });
  return { data: r.data, isLoading: r.isLoading, error: toErrMsg(r.error), refetch: wrapRefetch(r.refetch) };
}

export function useUpdateUserMutation() {
  const [trigger, result] = apiSlice.useUpdateUserMutation();
  return wrapMutation<
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
  >(trigger, result);
}

export function useUpdatePasswordMutation() {
  const [trigger, result] = apiSlice.useUpdatePasswordMutation();
  return wrapMutation<any, { currentPassword?: string; newPassword: string }>(trigger, result);
}

export function useRequestDeletionMutation() {
  const [trigger, result] = apiSlice.useRequestDeletionMutation();
  return wrapMutation<any, void>(trigger as any, result);
}

export function useDeleteAccountMutation() {
  const [trigger, result] = apiSlice.useDeleteAccountMutation();
  return wrapMutation<any, { otp: string }>(trigger, result);
}

// ---------------------------------------------------------------------------
// Module registry
// ---------------------------------------------------------------------------

export function useGetModuleRegistryQuery(_?: undefined, options?: { skip?: boolean }) {
  const r = apiSlice.useGetModuleRegistryQuery(undefined, { skip: options?.skip });
  return { data: r.data, isLoading: r.isLoading, error: toErrMsg(r.error), refetch: wrapRefetch(r.refetch) };
}

// ---------------------------------------------------------------------------
// Children
// ---------------------------------------------------------------------------

export function useGetChildrenQuery(_?: undefined, options?: { skip?: boolean }) {
  const r = apiSlice.useGetChildrenQuery(undefined, { skip: options?.skip });
  return { data: r.data, isLoading: r.isLoading, error: toErrMsg(r.error), refetch: wrapRefetch(r.refetch) };
}

export function useCreateChildMutation() {
  const [trigger, result] = apiSlice.useCreateChildMutation();
  return wrapMutation<any, { name: string; age: number; gender: string }>(trigger, result);
}

export function useUpdateChildMutation() {
  const [trigger, result] = apiSlice.useUpdateChildMutation();
  return wrapMutation<any, { id: string; name?: string; age?: number; gender?: string }>(trigger, result);
}

export function useDeleteChildMutation() {
  const [trigger, result] = apiSlice.useDeleteChildMutation();
  return wrapMutation<any, string>(trigger, result);
}

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export function useGetPaymentHistoryQuery(_?: undefined, options?: { skip?: boolean }) {
  const r = apiSlice.useGetPaymentHistoryQuery(undefined, { skip: options?.skip });
  return { data: r.data, isLoading: r.isLoading, error: toErrMsg(r.error), refetch: wrapRefetch(r.refetch) };
}

export function useStartTrialMutation() {
  const [trigger, result] = apiSlice.useStartTrialMutation();
  return wrapMutation<any, void>(trigger as any, result);
}

export function useStartPlanMutation() {
  const [trigger, result] = apiSlice.useStartPlanMutation();
  return wrapMutation<any, { planName: string }>(trigger, result);
}

export function useSavePaymentMethodMutation() {
  const [trigger, result] = apiSlice.useSavePaymentMethodMutation();
  return wrapMutation<any, { paymentMethodId: string }>(trigger, result);
}

// ---------------------------------------------------------------------------
// Access
// ---------------------------------------------------------------------------

export function useGetAccessStatusQuery(
  params: { childId?: string; module?: number; quest?: number; screen?: number } | undefined,
  options?: { skip?: boolean },
) {
  const r = apiSlice.useGetAccessStatusQuery(params!, {
    skip: !params || options?.skip,
  });
  return { data: r.data, isLoading: r.isLoading, error: toErrMsg(r.error), refetch: wrapRefetch(r.refetch) };
}

export function useGetAccessListQuery(
  params: { childId: string; include?: string[] } | undefined,
  options?: { skip?: boolean },
) {
  const r = apiSlice.useGetAccessListQuery(params!, {
    skip: !params || options?.skip,
  });
  return {
    data: r.data as AccessListResponse | undefined,
    isLoading: r.isLoading,
    error: toErrMsg(r.error),
    refetch: wrapRefetch(r.refetch),
  };
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function useGetChildDashboardQuery(
  params: { childId: string; include?: string[] } | undefined,
  options?: { skip?: boolean },
) {
  const r = apiSlice.useGetChildDashboardQuery(params!, {
    skip: !params || options?.skip,
  });
  return { data: r.data, isLoading: r.isLoading, error: toErrMsg(r.error), refetch: wrapRefetch(r.refetch) };
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export function useGetScreenQuery(
  params:
    | { childId: string; moduleNo: number; questNo: number; screenNo: number }
    | undefined,
  options?: { skip?: boolean },
) {
  const r = apiSlice.useGetScreenQuery(params!, {
    skip: !params || options?.skip,
  });
  return { data: r.data, isLoading: r.isLoading, error: toErrMsg(r.error), refetch: wrapRefetch(r.refetch) };
}

export function useSaveScreenMutation() {
  const [trigger, result] = apiSlice.useSaveScreenMutation();
  return wrapMutation<
    any,
    {
      childId: string;
      moduleNo: number;
      questNo: number;
      screenNo: number;
      isCompleted: boolean;
      data?: Record<string, unknown>;
    }
  >(trigger, result);
}
