import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import cartReducer from './slices/cartSlice';
import courseReducer from './slices/courseSlice';

// Configure persist for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'signupData'] // Only persist these fields
};

// Configure persist for profile
const profilePersistConfig = {
  key: 'profile',
  storage,
  whitelist: ['user'] // Only persist user data
};

// Configure persist for cart
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['cart', 'totalItems', 'total'] // Persist cart data
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedProfileReducer = persistReducer(profilePersistConfig, profileReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    profile: persistedProfileReducer,
    cart: persistedCartReducer,
    course: courseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export default store; 