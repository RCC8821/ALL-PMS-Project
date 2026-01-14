// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/Auth/AuthSlice'; // Agar yeh line error de rahi hai to path fix karo

// RTK Query slice import (aapne jo banaya tha)
import { fullkittingApi } from './features/Curing/fullkittingSlice'; // Path adjust karo agar alag folder mein hai

export const store = configureStore({
  reducer: {
    auth: authReducer,                     // Auth slice
    [fullkittingApi.reducerPath]: fullkittingApi.reducer,  // RTK Query reducer
    // Agar aur slices hain to yahan add karte jao
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(fullkittingApi.middleware), // RTK Query middleware zaroori hai
});