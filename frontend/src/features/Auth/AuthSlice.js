

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async Thunk for Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Login failed');
      }

      // हमेशा uppercase में normalize करो (स्पेस भी हटाओ)
      const normalizedUserType = (result.userType || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ''); // extra spaces हटाने के लिए

      // sessionStorage में normalized version ही save करो
      sessionStorage.setItem('token', result.token);
      sessionStorage.setItem('userType', normalizedUserType);

      return { 
        token: result.token, 
        userType: normalizedUserType 
      };
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: sessionStorage.getItem('token') || null,
    userType: sessionStorage.getItem('userType') || null, // पहले से normalized होगा
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.userType = null;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userType');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.userType = action.payload.userType; // already normalized
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;