// // src/services/labourApi.js   (or whatever name you prefer)

// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// export const labourApi = createApi({
//   reducerPath: 'labourApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: BASE_URL,
//     prepareHeaders: (headers) => {
//       // Add auth token / other headers if needed later
//       return headers;
//     },
//   }),

//   tagTypes: [
//     'LabourDropdowns',     // for dropdown data
//     'LabourAttendance',    // for in/out entries (can invalidate on submit)
//   ],

//   endpoints: (builder) => ({

//     // ────────────────────────────────────────────────
//     // Get all dropdown data (sites, labor types, names, etc.)
//     // ────────────────────────────────────────────────
//     getLabourDropdownData: builder.query({
//       query: () => '/api/Labour-dropdown-data',
//       providesTags: ['LabourDropdowns'],
//       transformResponse: (response) => {
//         // response shape: { success: true, data: { siteNames: [], ... } }
//         if (!response?.success) return { success: false, data: {} };
//         return response.data || {};
//       },
//     }),

//     // ────────────────────────────────────────────────
//     // Submit In / Attendance entries
//     // ────────────────────────────────────────────────
//     submitLabourInEntries: builder.mutation({
//       query: (formData) => ({
//         url: '/api/Labour-submit-entries',
//         method: 'POST',
//         body: formData,
//       }),
//       invalidatesTags: ['LabourAttendance'], // optional: if you later add list query
//       transformResponse: (response) => {
//         // Expected: { success: true, message: "...", insertedCount: N }
//         return response || { success: false, message: 'No response' };
//       },
//     }),

//     // ────────────────────────────────────────────────
//     // Submit Out entries
//     // ────────────────────────────────────────────────
//     submitLabourOutEntries: builder.mutation({
//       query: (formData) => ({
//         url: '/api/Labour-submit-out-entries',
//         method: 'POST',
//         body: formData,
//       }),
//       invalidatesTags: ['LabourAttendance'],
//       transformResponse: (response) => {
//         return response || { success: false, message: 'No response' };
//       },
//     }),

//     // ────────────────────────────────────────────────
//     // Optional: if you later want to fetch recent entries or summary
//     // getRecentAttendance: builder.query({
//     //   query: () => '/api/recent-attendance',
//     //   providesTags: ['LabourAttendance'],
//     // }),
//   }),
// });

// // Export hooks for usage in functional components
// export const {
//   useGetLabourDropdownDataQuery,
//   useSubmitLabourInEntriesMutation,
//   useSubmitLabourOutEntriesMutation,
//   // useGetRecentAttendanceQuery,   // if you add later
// } = labourApi;




// src/services/labourApi.js   (or whatever name you prefer)

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const labourApi = createApi({
  reducerPath: 'labourApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // Add auth token / other headers if needed later
      return headers;
    },
  }),

  tagTypes: [
    'LabourDropdowns',     // for dropdown data
    'LabourAttendance',    // for in/out entries (can invalidate on submit)
    'EmployeeNames',       // for employee names (new)
  ],

  endpoints: (builder) => ({

    // ────────────────────────────────────────────────
    // Get all dropdown data (sites, labor types, names, etc.)
    // ────────────────────────────────────────────────
    getLabourDropdownData: builder.query({
      query: () => '/api/Labour-dropdown-data',
      providesTags: ['LabourDropdowns', 'EmployeeNames'],
      transformResponse: (response) => {
        // response shape: { success: true, data: { siteNames: [], ... } }
        if (!response?.success) return { success: false, data: {} };
        return response.data || {};
      },
    }),

    // ────────────────────────────────────────────────
    // Add new employee name (नया नाम जोड़ने के लिए)
    // ────────────────────────────────────────────────
    addEmployeeName: builder.mutation({
      query: (employeeData) => ({
        url: '/api/Labour-add-employee-name',
        method: 'POST',
        body: employeeData,
        // Expected body: { firstName: string, lastName: string, laborType: string }
      }),
      invalidatesTags: ['LabourDropdowns', 'EmployeeNames'],
      // यह invalidate करने से dropdown data फिर से fetch होगा
      transformResponse: (response) => {
        // Expected: { success: true, message: "...", data: { id, name, laborType } }
        return response || { success: false, message: 'No response' };
      },
      transformError: (error) => {
        // Handle error response
        return error?.data || { success: false, message: 'Failed to add employee' };
      },
    }),

    // ────────────────────────────────────────────────
    // Submit In / Attendance entries
    // ────────────────────────────────────────────────
    submitLabourInEntries: builder.mutation({
      query: (formData) => ({
        url: '/api/Labour-submit-entries',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['LabourAttendance'], // optional: if you later add list query
      transformResponse: (response) => {
        // Expected: { success: true, message: "...", insertedCount: N }
        return response || { success: false, message: 'No response' };
      },
    }),

    // ────────────────────────────────────────────────
    // Submit Out entries
    // ────────────────────────────────────────────────
    submitLabourOutEntries: builder.mutation({
      query: (formData) => ({
        url: '/api/Labour-submit-out-entries',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['LabourAttendance'],
      transformResponse: (response) => {
        return response || { success: false, message: 'No response' };
      },
    }),

    // ────────────────────────────────────────────────
    // Optional: if you later want to fetch recent entries or summary
    // getRecentAttendance: builder.query({
    //   query: () => '/api/recent-attendance',
    //   providesTags: ['LabourAttendance'],
    // }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetLabourDropdownDataQuery,
  useAddEmployeeNameMutation,
  useSubmitLabourInEntriesMutation,
  useSubmitLabourOutEntriesMutation,
  // useGetRecentAttendanceQuery,   // if you add later
} = labourApi;