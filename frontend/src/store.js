// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/Auth/AuthSlice'; // Agar yeh line error de rahi hai to path fix karo

// RTK Query slice import (aapne jo banaya tha)
import { fullkittingApi } from './features/Curing/fullkittingSlice';
import {fullkittingCastingApi} from "./features/Casting/FullkittingCastingSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,                     // Auth slice
    [fullkittingApi.reducerPath]: fullkittingApi.reducer,  
    [fullkittingCastingApi.reducerPath]: fullkittingCastingApi.reducer,  
    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
  .concat(fullkittingApi.middleware)
  .concat(fullkittingCastingApi.middleware) 
});