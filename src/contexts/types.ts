// Global type definitions for application state

// export interface User {
//   username: string;
//   name?: string;
//   email?: string;
//   phone?: string;
// }
// In src/contexts/types.ts
export interface User {
  _id: string; // Add _id as it's usually returned and useful
  username: string;
  name?: string; // Keep optional if they aren't always required
  email: string;  // Make required if it is in your schema
  phone?: string; // Keep optional if it isn't always required
  balance: number; // <-- ADD THIS LINE (make it required number)
  // Add any other fields returned by your backend profile endpoint (e.g., role, createdAt)
  role?: string;
  isVerified?: boolean;
  createdAt?: string | Date; // Use string if backend sends ISO string, Date if you convert
  updatedAt?: string | Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}

export interface ThemeState {
  mode: 'light' | 'dark';
  primaryColor: string;
}

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}

export interface AppState {
  auth: AuthState;
  theme: ThemeState;
  location: LocationState;
}

export type AppAction = 
  | { type: 'LOGIN_SUCCESS', payload: { user: User, token: string } }
  | { type: 'LOGIN_FAILURE', payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER', payload: Partial<User> }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_LOCATION', payload: { latitude: number, longitude: number, address: string } }
  | { type: 'CLEAR_LOCATION' };
