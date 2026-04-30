import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig } from "axios";
import instance from "./axios-instance";
import { moduleRegistry } from "@/lib/module-registry";
import type { AccessListResponse } from "./access-list";

type AxiosArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: unknown;
  headers?: AxiosRequestConfig["headers"];
};

type ApiError = { status?: number; data: unknown };

const axiosBaseQuery: BaseQueryFn<AxiosArgs, unknown, ApiError> = async ({
  url,
  method = "GET",
  data,
  params,
  headers,
}) => {
  try {
    const result = await instance({ url, method, data, params, headers });
    return { data: result.data };
  } catch (err: any) {
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data ?? err.message,
      },
    };
  }
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery,
  tagTypes: [
    "User",
    "Children",
    "PaymentHistory",
    "AccessList",
    "AccessStatus",
    "ChildDashboard",
    "Screen",
    "Health",
  ],
  endpoints: (builder) => ({
    // --- Health ---
    getHealth: builder.query<{ status: string; timestamp: string }, void>({
      query: () => ({ url: "/health" }),
      providesTags: ["Health"],
    }),

    // --- User ---
    getMe: builder.query<any, void>({
      query: () => ({ url: "/users/me" }),
      providesTags: ["User"],
    }),
    updateUser: builder.mutation<
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
    >({
      // FormData upload — can't go through the standard baseQuery
      queryFn: async ({ profileImage, ...fields }) => {
        try {
          const form = new FormData();
          Object.entries(fields).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") form.append(k, String(v));
          });
          if (profileImage) form.append("profileImage", profileImage);
          const result = await instance.patch("/users/me", form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          return { data: result.data };
        } catch (err: any) {
          return {
            error: {
              status: err.response?.status,
              data: err.response?.data ?? err.message,
            },
          };
        }
      },
      invalidatesTags: ["User"],
    }),
    updatePassword: builder.mutation<any, { currentPassword?: string; newPassword: string }>({
      query: (body) => ({ url: "/users/me/password", method: "PATCH", data: body }),
      invalidatesTags: ["User"],
    }),
    requestDeletion: builder.mutation<any, void>({
      query: () => ({ url: "/users/me/request-deletion", method: "POST" }),
    }),
    deleteAccount: builder.mutation<any, { otp: string }>({
      query: (body) => ({ url: "/users/me", method: "DELETE", data: body }),
    }),

    // --- Module registry (static — no network call, cached indefinitely) ---
    getModuleRegistry: builder.query<any, void>({
      queryFn: () => ({ data: moduleRegistry }),
      keepUnusedDataFor: Infinity,
    }),

    // --- Children ---
    getChildren: builder.query<any[], void>({
      query: () => ({ url: "/children" }),
      providesTags: (result) => [
        { type: "Children" as const, id: "LIST" },
        ...(result ?? []).map((c) => ({ type: "Children" as const, id: c.id })),
      ],
    }),
    createChild: builder.mutation<any, { name: string; age: number; gender: string }>({
      query: (body) => ({ url: "/children", method: "POST", data: body }),
      invalidatesTags: [{ type: "Children", id: "LIST" }],
    }),
    updateChild: builder.mutation<any, { id: string; name?: string; age?: number; gender?: string }>({
      query: ({ id, ...body }) => ({ url: `/children/${id}`, method: "PATCH", data: body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Children", id: "LIST" },
        { type: "Children", id: arg.id },
      ],
    }),
    deleteChild: builder.mutation<any, string>({
      query: (id) => ({ url: `/children/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "Children", id: "LIST" },
        { type: "ChildDashboard", id: "LIST" },
        { type: "AccessList", id: "LIST" },
      ],
    }),

    // --- Payment ---
    getPaymentHistory: builder.query<any[], void>({
      query: () => ({ url: "/payment/history" }),
      providesTags: ["PaymentHistory"],
    }),
    startTrial: builder.mutation<any, void>({
      query: () => ({ url: "/payment/start-trial", method: "POST" }),
      invalidatesTags: [
        "User",
        "PaymentHistory",
        { type: "ChildDashboard", id: "LIST" },
        { type: "AccessList", id: "LIST" },
      ],
    }),
    startPlan: builder.mutation<any, { planName: string }>({
      query: (body) => ({ url: "/payment/start-plan", method: "POST", data: body }),
      invalidatesTags: [
        "User",
        "PaymentHistory",
        { type: "ChildDashboard", id: "LIST" },
        { type: "AccessList", id: "LIST" },
      ],
    }),
    // --- Access ---
    getAccessStatus: builder.query<
      any,
      { childId?: string; module?: number; quest?: number; screen?: number }
    >({
      query: (params) => ({ url: "/modules/get-access-status", params }),
      providesTags: (_r, _e, arg) => [
        {
          type: "AccessStatus",
          id: `${arg.childId}-${arg.module}-${arg.quest}-${arg.screen}`,
        },
      ],
    }),
    getAccessList: builder.query<AccessListResponse, { childId: string; include?: string[] }>({
      query: ({ childId, include }) => ({
        url: "/modules/access-list",
        params: {
          childId,
          ...(include?.length ? { include: include.join(",") } : {}),
        },
      }),
      providesTags: (_r, _e, arg) => [{ type: "AccessList", id: arg.childId }],
    }),

    // --- Dashboard ---
    getChildDashboard: builder.query<any, { childId: string; include?: string[] }>({
      query: ({ childId, include }) => ({
        url: `/dashboard/${childId}`,
        params: include?.length ? { include: include.join(",") } : undefined,
      }),
      providesTags: (_r, _e, arg) => [{ type: "ChildDashboard", id: arg.childId }],
    }),

    // --- Progress ---
    getScreen: builder.query<
      any,
      { childId: string; moduleNo: number; questNo: number; screenNo: number }
    >({
      query: ({ childId, moduleNo, questNo, screenNo }) => ({
        url: `/children/${childId}/progress/${moduleNo}/${questNo}/${screenNo}`,
      }),
      providesTags: (_r, _e, arg) => [
        {
          type: "Screen",
          id: `${arg.childId}-${arg.moduleNo}-${arg.questNo}-${arg.screenNo}`,
        },
      ],
    }),
    saveScreen: builder.mutation<
      any,
      {
        childId: string;
        moduleNo: number;
        questNo: number;
        screenNo: number;
        isCompleted: boolean;
        data?: Record<string, unknown>;
      }
    >({
      query: ({ childId, moduleNo, questNo, screenNo, ...body }) => ({
        url: `/children/${childId}/progress/${moduleNo}/${questNo}/${screenNo}`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        {
          type: "Screen",
          id: `${arg.childId}-${arg.moduleNo}-${arg.questNo}-${arg.screenNo}`,
        },
        { type: "ChildDashboard", id: arg.childId },
        { type: "AccessList", id: arg.childId },
        // Invalidate all access-status entries for this child since multiple screens may unlock
        { type: "AccessStatus", id: "LIST" },
      ],
    }),
  }),
});
