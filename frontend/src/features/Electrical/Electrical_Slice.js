// // src/features/Electrical/ElectricalSlice.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


// const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// export const electricalApi = createApi({
//   reducerPath: 'electricalApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: BASE_URL, // Tumhara router path adjust karo
//     prepareHeaders: (headers) => {
//       // Auth token if needed
//       const token = localStorage.getItem('token');
//       if (token) headers.set('authorization', `Bearer ${token}`);
//       return headers;
//     },
//   }),
//   tagTypes: ['Electrical'], // Auto refetch ke liye
//   endpoints: (builder) => ({
//     // === 1. GET Electrical Data (Pending items only, A7 start) ===
//     getElectricalData: builder.query({
//       query: () => '/api/electrical/Get-electrical-data',
//       providesTags: ['Electrical'],
//       transformResponse: (response) => {
//         console.log('[RTK] Electrical Data Loaded:', response.data.length, 'rows');
//         return response.data || [];
//       },
//     }),

//     // === 2. SUBMIT Fullkitting (20 images, Typeofelectrical, N-AG columns) ===
//     submitElectricalFullkitting: builder.mutation({
//       query: (body) => ({
//         url: '/api/electrical/submit-Electrical-Fullkitting',
//         method: 'POST',
//         body,
//       }),
//       invalidatesTags: ['Electrical'], // Auto refetch list
//     }),

//     // === 3. SUBMIT Checklist Item (Section-wise: Safety=6 imgs L col, others status+img+remark) ===
//     submitElectricalChecklistItem: builder.mutation({
//       query: (body) => ({
//         url: '/api/electrical/submit-electrical-checklist-item',
//         method: 'POST',
//         body,
//       }),
//       invalidatesTags: ['Electrical'],
//     }),

//     // === 4. GET Checklist Status (9 sections progress, Done count) ===
//     getElectricalChecklistStatus: builder.query({
//       query: ({ electricalID }) => `/api/get-electrical-checklist-status/${electricalID}`,
//       providesTags: ['Electrical'],
//       transformResponse: (response) => {
//         console.log('[RTK] Status for', response.electricalID, ':', response.completedCount, '/9 Done');
//         return response;
//       },
//     }),
//   }),
// });

// // Auto-generated hooks (AttendanceSlice jaise)
// export const {
//   useGetElectricalDataQuery,
//   useSubmitElectricalFullkittingMutation,
//   useSubmitElectricalChecklistItemMutation,
//   useGetElectricalChecklistStatusQuery,
//   useLazyGetElectricalChecklistStatusQuery,
// } = electricalApi;

// export default electricalApi;




// src/features/Electrical/ElectricalSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const electricalApi = createApi({
  reducerPath: 'electricalApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Electrical'],
  endpoints: (builder) => ({
    // === 1. GET Electrical Data ===
    getElectricalData: builder.query({
      query: () => '/api/electrical/Get-electrical-data',
      providesTags: ['Electrical'],
      transformResponse: (response) => {
        console.log('[RTK] Electrical Data Loaded:', response.data?.length || 0, 'rows');
        return response.data || [];
      },
      transformErrorResponse: (error) => {
        console.error('[RTK] Get Electrical Data Error:', error);
        return error;
      },
    }),

    // === 2. SUBMIT Fullkitting ===
    submitElectricalFullkitting: builder.mutation({
      query: (body) => {
        console.log('[RTK] Submitting Fullkitting:', body.electricalID, body.Typeofelectrical);
        return {
          url: '/api/electrical/submit-Electrical-Fullkitting',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['Electrical'],
      transformErrorResponse: (error) => {
        console.error('[RTK] Fullkitting Submit Error:', error);
        return error;
      },
    }),

    // === 3. SUBMIT Checklist Item ===
    submitElectricalChecklistItem: builder.mutation({
      query: (body) => {
        console.log('[RTK] Submitting Checklist Item:', body.electricalID, body.section);
        return {
          url: '/api/electrical/submit-electrical-checklist-item',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['Electrical'],
      transformErrorResponse: (error) => {
        console.error('[RTK] Checklist Submit Error:', error);
        return error;
      },
    }),

    // === 4. GET Checklist Status (sirf electricalID) ===
    getElectricalChecklistStatus: builder.query({
      query: ({ electricalID }) => {
        console.log('[RTK] Fetching Checklist Status for electricalID:', electricalID);
        const url = `/api/electrical/get-electrical-checklist-status/${electricalID}`;
        console.log('[RTK] Final URL:', url);
        return url;
      },
      providesTags: (result, error, { electricalID }) => [
        { type: 'Electrical', id: electricalID }
      ],
      transformResponse: (response) => {
        console.log('[RTK] Checklist Status Response:', response);
        return {
          success: response.success || false,
          electricalID: response.electricalID,
          completedItems: response.completedItems || [],
          completedCount: response.completedCount || 0,
          statusMap: response.statusMap || {},
          details: response.details || {},
        };
      },
      transformErrorResponse: (error) => {
        console.error('[RTK] Checklist Status Error:', error);
        return error;
      },
    }),
  }),
});

export const {
  useGetElectricalDataQuery,
  useSubmitElectricalFullkittingMutation,
  useSubmitElectricalChecklistItemMutation,
  useGetElectricalChecklistStatusQuery,
  useLazyGetElectricalChecklistStatusQuery,
} = electricalApi;

export default electricalApi;