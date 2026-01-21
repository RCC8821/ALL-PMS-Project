// // src/features/Casting/FullkittingCastingSlice.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// export const fullkittingCastingApi = createApi({
//   reducerPath: 'fullkittingCastingApi',  // ये unique रखना, duplicate मत होने देना

//   baseQuery: fetchBaseQuery({
//     baseUrl: BASE_URL,
//     prepareHeaders: (headers) => {
//       // token चाहिए तो यहाँ बाद में डाल सकते हो
//       return headers;
//     },
//   }),

//   tagTypes: ['FullkittingCastingData'],

//   endpoints: (builder) => ({
//     getFullkittingCastingData: builder.query({
//       query: () => '/api/Get-fullkitting-Casting-data',
//       providesTags: ['FullkittingCastingData'],
//       transformResponse: (response) => response?.data || [],
//     }),

//     submitFullkittingCasting: builder.mutation({
//       query: (body) => ({
//         url: '/api/submit-Casting-Fullkitting',
//         method: 'POST',
//         body,
//       }),
//       invalidatesTags: ['FullkittingCastingData'],
//     }),
//   }),
// });

// export const {
//   useGetFullkittingCastingDataQuery,
//   useSubmitFullkittingCastingMutation,
// } = fullkittingCastingApi;






// // src/features/Casting/FullkittingCastingSlice.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// export const fullkittingCastingApi = createApi({
//   reducerPath: 'fullkittingCastingApi',

//   baseQuery: fetchBaseQuery({
//     baseUrl: BASE_URL,
//     prepareHeaders: (headers) => {
//       // अगर authentication token चाहिए तो यहाँ जोड़ सकते हैं
//       // const token = localStorage.getItem('token');
//       // if (token) headers.set('Authorization', `Bearer ${token}`);
//       return headers;
//     },
//   }),

//   tagTypes: ['FullkittingCastingData', 'ChecklistData'],  // नया tag checklist के लिए

//   endpoints: (builder) => ({
//     // पुरानी query - कोई बदलाव नहीं
//     getFullkittingCastingData: builder.query({
//       query: () => '/api/Get-fullkitting-Casting-data',
//       providesTags: ['FullkittingCastingData'],
//       transformResponse: (response) => response?.data || [],
//     }),

//     // पुरानी mutation - Fullkitting के लिए
//     submitFullkittingCasting: builder.mutation({
//       query: (body) => ({
//         url: '/api/submit-Casting-Fullkitting',
//         method: 'POST',
//         body,
//       }),
//       invalidatesTags: ['FullkittingCastingData'],
//     }),

//     // नई mutation → Checklist items (Safety, Casting, Deshuttering, Repair, Quality)
//     submitChecklistItem: builder.mutation({
//       query: (body) => ({
//         url: '/api/submit-casting-checklist-item',
//         method: 'POST',
//         body,
//       }),
//       // जब भी checklist item submit होता है → table data refresh हो
//       invalidatesTags: ['FullkittingCastingData'],
//       // अगर अलग checklist state manage कर रहे हो तो यहाँ extra tag invalidates कर सकते हो
//       // invalidatesTags: (result, error, arg) => [{ type: 'ChecklistData', id: arg.CuringUID }],
//     }),
//   }),
// });

// export const {
//   useGetFullkittingCastingDataQuery,
//   useSubmitFullkittingCastingMutation,
//   useSubmitChecklistItemMutation,          // ← नया hook
// } = fullkittingCastingApi;




/////////////////////// final ///////////////////



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