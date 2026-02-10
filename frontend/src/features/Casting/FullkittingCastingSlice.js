

// src/features/Casting/FullkittingCastingSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
 

export const fullkittingCastingApi = createApi({
  reducerPath: 'fullkittingCastingApi',

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // अगर token चाहिए तो यहाँ जोड़ सकते हो
      // const token = localStorage.getItem('token');
      // if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ['FullkittingCastingData', 'ChecklistData'],

  endpoints: (builder) => ({
    // पुरानी query - casting records
    getFullkittingCastingData: builder.query({
      query: () => '/api/Get-fullkitting-Casting-data',
      providesTags: ['FullkittingCastingData'],
      transformResponse: (response) => response?.data || [],
    }),

    // पुरानी mutation - fullkitting submit
    submitFullkittingCasting: builder.mutation({
      query: (body) => ({
        url: '/api/submit-Casting-Fullkitting',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FullkittingCastingData'],
    }),

    // Checklist item submit (पहले से थी)
    submitChecklistItem: builder.mutation({
      query: (body) => ({
        url: '/api/submit-casting-checklist-item',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FullkittingCastingData', 'ChecklistData'],
    }),

    // नई query → किसी CuringUID का checklist status / completed items लाने के लिए
    getChecklistStatus: builder.query({
      query: (curingUID) => `/api/get-checklist-status/${curingUID}`,
      providesTags: (result, error, curingUID) => [{ type: 'ChecklistData', id: curingUID }],
      transformResponse: (response) => response || { completedItems: [] },
    }),
  }),
});

export const {
  useGetFullkittingCastingDataQuery,
  useSubmitFullkittingCastingMutation,
  useSubmitChecklistItemMutation,
  useGetChecklistStatusQuery,          // ← नया hook
} = fullkittingCastingApi;