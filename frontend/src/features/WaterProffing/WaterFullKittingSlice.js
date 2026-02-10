// src/features/waterproofing/waterproofingApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';  // fallback अगर env न मिले

export const waterproofingApi = createApi({
  reducerPath: 'waterproofingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendUrl}/api`,  // ← अब env से आएगा, e.g. http://localhost:5000/api
    // credentials: 'include', // अगर cookies/auth चाहिए तो
  }),

  tagTypes: ['FullKittingData', 'ChecklistStatus'],

  endpoints: (builder) => ({

    getFullKittingData: builder.query({
      query: () => '/water/Get-fullkitting-data',
      providesTags: ['FullKittingData'],
    }),

    submitFullKitting: builder.mutation({
      query: (body) => ({
        url: '/water/submit-WaterProffing-Fullkitting',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FullKittingData', 'ChecklistStatus'],
    }),

    submitChecklistItem: builder.mutation({
      query: (body) => ({
        url: '/water/submit-waterproofing-checklist-item',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'ChecklistStatus', id: arg.WaterProffingUID },
        'FullKittingData',
      ],
    }),

    getChecklistStatus: builder.query({
      query: (WaterProffingUID) => 
        `/water/get-waterproofing-checklist-status/${WaterProffingUID}`,
      providesTags: (result, error, WaterProffingUID) => [
        { type: 'ChecklistStatus', id: WaterProffingUID },
      ],
    }),

  }),
});

export const {
  useGetFullKittingDataQuery,
  useSubmitFullKittingMutation,
  useSubmitChecklistItemMutation,
  useGetChecklistStatusQuery,
} = waterproofingApi;