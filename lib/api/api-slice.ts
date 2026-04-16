import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  }),
  endpoints: (builder) => ({
    getHealth: builder.query<{ status: string; timestamp: string }, void>({
      query: () => "/health",
    }),
  }),
});

export const { useGetHealthQuery } = apiSlice;
