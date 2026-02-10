// src/features/BrickWork/BrickWorkSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const brickWorkApi = createApi({
  reducerPath: 'brickWorkApi',

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // अगर authentication चाहिए तो यहाँ token सेट कर सकते हो
      // const token = localStorage.getItem('token');
      // if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ['FullkittingBrickData', 'BrickChecklistData'],

  endpoints: (builder) => ({
    // GET - Fullkitting Brickwork records लाने के लिए
    getFullkittingBrickData: builder.query({
      query: () => '/api/Bricks/Get-fullkitting-Bricks',
      providesTags: ['FullkittingBrickData'],
      transformResponse: (response) => response?.data || [],
    }),

    // POST - Fullkitting submit (12 images वाला)
    submitFullkittingBrick: builder.mutation({
      query: (body) => ({
        url: '/api/Bricks/submit-BrickWork-Fullkitting',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FullkittingBrickData'],
    }),

    // POST - Checklist item submit (Safety, Brick sections, Quality check)
    submitBrickChecklistItem: builder.mutation({
      query: (body) => ({
        url: '/api/Bricks/submit-BrickWork-checklist-item',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        'FullkittingBrickData',
        { type: 'BrickChecklistData', id: arg?.BrickworkUID || 'LIST' },
      ],
    }),

    // GET - किसी BrickworkUID का checklist status / completed sections लाने के लिए
    getBrickChecklistStatus: builder.query({
      query: (brickworkUID) => `/api/Bricks/get-BrickWork-checklist-status/${brickworkUID}`,
      providesTags: (result, error, brickworkUID) => [
        { type: 'BrickChecklistData', id: brickworkUID },
      ],
      transformResponse: (response) => response || {
        completedItems: [],
        statusMap: {},
        details: {},
        completedCount: 0,
        totalSections: 9,
      },
    }),
  }),
});

export const {
  useGetFullkittingBrickDataQuery,
  useSubmitFullkittingBrickMutation,
  useSubmitBrickChecklistItemMutation,
  useGetBrickChecklistStatusQuery,
  useLazyGetBrickChecklistStatusQuery,     // अगर lazy इस्तेमाल करना हो तो
} = brickWorkApi;