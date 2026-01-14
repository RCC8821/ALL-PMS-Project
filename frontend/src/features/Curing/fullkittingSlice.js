
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const fullkittingApi = createApi({
  reducerPath: 'fullkittingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // Add auth token later if needed
      // const token = localStorage.getItem('token');
      // if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ['FullkittingData', 'CuringProgress'],

  endpoints: (builder) => ({
    // ─────────────────────────────────────────────────────────────
    // 1. Get Fullkitting List
    // ─────────────────────────────────────────────────────────────
    getFullkittingData: builder.query({
      query: () => '/api/Get-fullkitting-data',
      providesTags: ['FullkittingData'],
      transformResponse: (response) => response.data || [],
    }),

    // ─────────────────────────────────────────────────────────────
    // 2. Submit Fullkitting (initial curing proof photos)
    // ─────────────────────────────────────────────────────────────
    submitFullkitting: builder.mutation({
      query: (body) => ({
        url: '/api/submit-Fullkitting',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FullkittingData', 'CuringProgress'],
    }),

    // ─────────────────────────────────────────────────────────────
    // 3. Get Curing Progress (which days are completed)
    // ─────────────────────────────────────────────────────────────
    getCuringProgress: builder.query({
      query: (curingUID) => `/api/curing-progress/${curingUID}`,
      providesTags: (result, error, curingUID) => [
        { type: 'CuringProgress', id: curingUID },
      ],
      transformResponse: (response) => response.progress || {
        completedDays: [],
        completedCount: 0,
        pendingCount: 15,
        isComplete: false
      },
    }),

    // ─────────────────────────────────────────────────────────────
    // 4. Submit Daily Curing Data (for day 1–15)
    // ─────────────────────────────────────────────────────────────
    submitDayCuring: builder.mutation({
      query: ({ curingUID, ...body }) => ({
        url: '/api/submit-day-curing',
        method: 'POST',
        body: { CuringUID: curingUID, ...body },
      }),
      // Invalidate both list & specific curing progress
      invalidatesTags: (result, error, { curingUID }) => [
        'FullkittingData',
        { type: 'CuringProgress', id: curingUID },
      ],
    }),
  }),
});

// Export hooks
export const {
  // List & Fullkitting submit
  useGetFullkittingDataQuery,
  useLazyGetFullkittingDataQuery,
  useSubmitFullkittingMutation,

  // Curing progress
  useGetCuringProgressQuery,
  useLazyGetCuringProgressQuery,

  // Daily curing
  useSubmitDayCuringMutation,
} = fullkittingApi;