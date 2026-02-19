
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const labourApi = createApi({
  reducerPath: 'labourApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // अगर बाद में JWT या अन्य auth token चाहिए तो यहाँ जोड़ सकते हैं
      return headers;
    },
  }),

  tagTypes: [
    'LabourDropdowns',
    'LabourAttendance',
    'EmployeeNames',
  ],

  endpoints: (builder) => ({

    // ड्रॉपडाउन डेटा (साइट्स, लेबर टाइप, नाम आदि)
    getLabourDropdownData: builder.query({
      query: () => '/api/Labour-dropdown-data',
      providesTags: ['LabourDropdowns', 'EmployeeNames'],
      transformResponse: (response) => {
        if (!response?.success) return { success: false, data: {} };
        return response.data || {};
      },
    }),

    // नया नाम जोड़ना
    addEmployeeName: builder.mutation({
      query: (employeeData) => ({
        url: '/api/Labour-add-employee-name',
        method: 'POST',
        body: employeeData,
      }),
      invalidatesTags: ['LabourDropdowns', 'EmployeeNames'],
      transformResponse: (response) => response || { success: false, message: 'No response' },
    }),

    // IN entries सबमिट करना
    submitLabourInEntries: builder.mutation({
      query: (formData) => ({
        url: '/api/Labour-submit-entries',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['LabourAttendance'],
      transformResponse: (response) => response || { success: false, message: 'No response' },
    }),

    // OUT entries सबमिट करना
    submitLabourOutEntries: builder.mutation({
      query: (formData) => ({
        url: '/api/Labour-submit-out-entries',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['LabourAttendance'],
      transformResponse: (response) => response || { success: false, message: 'No response' },
    }),

    // ────────────────────────────────────────────────
    // नया: आज का IN रिकॉर्ड चेक करने के लिए (OUT फॉर्म में autofill के लिए)
    // ────────────────────────────────────────────────
    checkInToday: builder.query({
      query: (name) => ({
        url: '/api/check-in-today',
        params: { name },   // ?name=... के रूप में जाएगा
      }),
      // कोई tag नहीं लगाया क्योंकि यह transient चेक है
      // अगर बहुत बार कॉल हो रही हो तो transformResponse में caching logic सोच सकते हैं
      transformResponse: (response) => {
        // response shape उम्मीद:
        // { success: true, hasIn: boolean, data?: { siteName, category, inTime } }
        if (!response?.success) {
          return { hasIn: false, data: null };
        }
        return {
          hasIn: !!response.hasIn,
          data: response.data || null
        };
      },
      // अगर आप चाहें तो error को बेहतर हैंडल करने के लिए
      transformErrorResponse: (response) => {
        return {
          hasIn: false,
          data: null,
          errorMessage: response?.data?.message || 'Failed to check IN record'
        };
      },
    }),

  }),
});

// Export hooks
export const {
  useGetLabourDropdownDataQuery,
  useAddEmployeeNameMutation,
  useSubmitLabourInEntriesMutation,
  useSubmitLabourOutEntriesMutation,
  useCheckInTodayQuery,           // ← नया hook
} = labourApi;