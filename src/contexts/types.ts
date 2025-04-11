// Global type definitions for application state

export interface User {
  username: string;
  name?: string;
  email?: string;
  phone?: string;
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
  | { type: 'CLEAR_LOCATION' }
  | { type: 'UPDATE_PROFILE_PHOTO'; payload: string };
