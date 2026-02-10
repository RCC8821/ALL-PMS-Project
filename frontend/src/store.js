// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/Auth/AuthSlice'; // Agar yeh line error de rahi hai to path fix karo

// RTK Query slice import (aapne jo banaya tha)
import { fullkittingApi } from './features/Curing/fullkittingSlice';
import {fullkittingCastingApi} from "./features/Casting/FullkittingCastingSlice"
import {waterproofingApi} from './features/WaterProffing/WaterFullKittingSlice'
import {brickWorkApi} from './features/BrickWork/BrickWorkSlice'
import {electricalApi} from './features/Electrical/Electrical_Slice'

import {labourApi} from './features/Labour/AttendanceSlice'


export const store = configureStore({
  reducer: {
    auth: authReducer,                     // Auth slice
    [fullkittingApi.reducerPath]: fullkittingApi.reducer,  
    [fullkittingCastingApi.reducerPath]: fullkittingCastingApi.reducer,  
    [waterproofingApi.reducerPath]: waterproofingApi.reducer,  
    [brickWorkApi.reducerPath]: brickWorkApi.reducer,  
    [electricalApi.reducerPath]: electricalApi.reducer,  
    [labourApi.reducerPath]: labourApi.reducer,  
    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
  .concat(fullkittingApi.middleware)
  .concat(fullkittingCastingApi.middleware) 
  .concat(waterproofingApi.middleware) 
  .concat(brickWorkApi.middleware) 
  .concat(electricalApi.middleware) 
  .concat(labourApi.middleware) 
});