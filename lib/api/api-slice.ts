import { createApi, fetchBaseQuery, FetchArgs } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";
import { moduleRegistry } from "../module-registry";

export const apiSlice = createApi({
  reducerPath: "api",
  tagTypes: ["getAccessHierarchy"],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    prepareHeaders: (headers) => {
      // Get token from Clerk that was fetched by the provider
      const token = (window as any).__clerkToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getHealth: builder.query<{ status: string; timestamp: string }, void>({
      query: () => "/health",
    }),
    getModuleRegistry: builder.query<any, void>({
      queryFn: () => ({
        data: moduleRegistry,
      }),
    }),
    getMe: builder.query<any, void>({
      query: () => "/users/me",
    }),
    startTrial: builder.mutation<any, void>({
      query: () => ({
        url: "/payment/start-trial",
        method: "POST",
      }),
    }),
    startPlan: builder.mutation<any, { planName: string }>({
      query: (body) => ({
        url: "/payment/start-plan",
        method: "POST",
        body,
      }),
    }),
    getPaymentHistory: builder.query<any[], void>({
      query: () => "/payment/history",
    }),
    getChildren: builder.query<any[], void>({
      query: () => "/children",
    }),
    createChild: builder.mutation<any, { name: string; dateOfBirth: string }>({
      query: (body) => ({
        url: "/children",
        method: "POST",
        body,
      }),
    }),
    updateChild: builder.mutation<any, { id: string; name?: string; dateOfBirth?: string }>({
      query: ({ id, ...body }) => ({
        url: `/children/${id}`,
        method: "PATCH",
        body,
      }),
    }),
    getAccessStatus: builder.query<any, { childId?: string; module?: number; quest?: number; screen?: number }>({
      query: (params) => ({
        url: "/modules/get-access-status",
        params,
      }),
    }),
    getAccessHierarchy: builder.query<any, { childId: string }>({
      query: (params) => ({
        url: "/modules/access-hierarchy",
        params: { childId: params.childId },
      }),
      providesTags: (result, error, arg) => [
        { type: "getAccessHierarchy", id: arg.childId },
      ],
    }),
    saveScreen: builder.mutation<any, { childId: string; moduleNo: number; questNo: number; screenNo: number; isCompleted: boolean; data?: Record<string, unknown> }>({
      query: ({ childId, moduleNo, questNo, screenNo, ...body }) => ({
        url: `/children/${childId}/progress/${moduleNo}/${questNo}/${screenNo}`,
        method: "POST",
        body,
      }),
      async onQueryStarted({ childId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate access hierarchy cache to refetch updated completion status
          dispatch(
            apiSlice.util.invalidateTags([
              { type: "getAccessHierarchy" as const, id: childId },
            ])
          );
        } catch (err) {
          // Error handled elsewhere
        }
      },
    }),
    getScreen: builder.query<any, { childId: string; moduleNo: number; questNo: number; screenNo: number }>({
      query: ({ childId, moduleNo, questNo, screenNo }) => ({
        url: `/children/${childId}/progress/${moduleNo}/${questNo}/${screenNo}`,
      }),
    }),
  }),
});

export const {
  useGetHealthQuery,
  useGetMeQuery,
  useGetModuleRegistryQuery,
  useStartTrialMutation,
  useStartPlanMutation,
  useGetPaymentHistoryQuery,
  useGetChildrenQuery,
  useCreateChildMutation,
  useUpdateChildMutation,
  useGetAccessStatusQuery,
  useGetAccessHierarchyQuery,
  useSaveScreenMutation,
  useGetScreenQuery,
} = apiSlice;
