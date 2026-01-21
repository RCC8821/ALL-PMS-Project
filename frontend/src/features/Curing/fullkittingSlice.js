
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const fullkittingApi = createApi({
  reducerPath: 'fullkittingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
      return headers;
    },
  }),

  tagTypes: ['FullkittingData', 'CuringProgress'],

 
  endpoints: (builder) => ({
 
    getFullkittingData: builder.query({
      query: () => '/api/Get-fullkitting-data',
      providesTags: ['FullkittingData'],
      transformResponse: (response) => response.data || [],
    }),

   
    submitFullkitting: builder.mutation({
      query: (body) => ({
        url: '/api/submit-Fullkitting',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FullkittingData', 'CuringProgress'],
    }),

    // ────────────────────────────────
    // सबसे महत्वपूर्ण हिस्सा - यहाँ बदलाव
    // ────────────────────────────────
    getCuringProgress: builder.query({
      query: (curingUID) => {
        if (!curingUID) return '/api/curing-progress/empty'; // safety
        return `/api/curing-progress/${encodeURIComponent(curingUID)}`;
      },

      // हमेशा tag बनाओ, result पर निर्भर मत रहो
      providesTags: (result, error, curingUID) => [
        { type: 'CuringProgress', id: curingUID || 'NO_UID' },
      ],

      // cache व्यवहार सुधारने के लिए
      keepUnusedDataFor: 30,                // कम समय cache रखो
      refetchOnMountOrArgChange: 10,        // arg बदलने पर जल्दी refetch
      refetchOnReconnect: true,

      transformResponse: (response) => {
        console.log('Raw API response in transform:', response);
        
        if (!response || !response.success) {
          return {
            completedDays: [],
            completedCount: 0,
            pendingCount: 15,
            isComplete: false
          };
        }

        return response.progress || {
          completedDays: [],
          completedCount: 0,
          pendingCount: 15,
          isComplete: false
        };
      },
    }),

    submitDayCuring: builder.mutation({
      query: ({ curingUID, ...body }) => ({
        url: '/api/submit-day-curing',
        method: 'POST',
        body: { CuringUID: curingUID, ...body },
      }),
      invalidatesTags: (result, error, { curingUID }) => [
        'FullkittingData',
        { type: 'CuringProgress', id: curingUID },
      ],
    }),
  }),
});

export const {
  useGetFullkittingDataQuery,
  useSubmitFullkittingMutation,
  useGetCuringProgressQuery,
  useSubmitDayCuringMutation,
} = fullkittingApi;