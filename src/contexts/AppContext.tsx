import React, { 
  createContext, 
  useReducer, 
  useContext, 
  Dispatch, 
  ReactNode,
  useEffect
} from 'react';
import { SugarTheme } from '../theme/SugarTheme';
import { 
  AppState, 
  AppAction, 
  AuthState, 
  ThemeState, 
  LocationState,
  User
} from './types';
import AuthService from '../services/AuthService';

// Initial State
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  error: null
};

const initialThemeState: ThemeState = {
  mode: 'light',
  primaryColor: SugarTheme.colors.primary
};

const initialLocationState: LocationState = {
  latitude: null,
  longitude: null,
  address: null
};

const initialState: AppState = {
  auth: initialAuthState,
  theme: initialThemeState,
  location: initialLocationState
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload.user,
          token: action.payload.token,
          error: null
        }
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        auth: {
          ...initialAuthState,
          error: action.payload
        }
      };
    case 'LOGOUT':
      return {
        ...state,
        auth: initialAuthState
      };
    case 'UPDATE_USER':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: state.auth.user ? { ...state.auth.user, ...action.payload } : null
        }
      };
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: {
          ...state.theme,
          mode: state.theme.mode === 'light' ? 'dark' : 'light'
        }
      };
    case 'SET_LOCATION':
      return {
        ...state,
        location: {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
          address: action.payload.address
        }
      };
    case 'CLEAR_LOCATION':
      return {
        ...state,
        location: initialLocationState
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        auth: {
          ...state.auth,
          error: null
        }
      };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, name?: string, email?: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  addBalance: (amount: number) => Promise<boolean>; // <-- Add this line
  clearError: () => void;
}>({
  state: initialState,
  dispatch: () => null,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  updateProfile: async () => false,
    addBalance: async () => false, // <-- Add default implementation
  clearError: () => {}
});

// Provider Component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check authentication on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = await AuthService.isAuthenticated();
        if (isAuthenticated) {
          const user = await AuthService.fetchUserProfile();
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { 
              user, 
              token: await AuthService.getToken() || '' 
            } 
          });
        }
      } catch (error) {
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuthStatus();
  }, []);

  // Authentication methods
  const login = async (username: string, password: string) => {
    try {
      const { user, token } = await AuthService.login({ username, password });
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token } 
      });
      return true;
    } catch (error: any) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error.toString() 
      });
      return false;
    }
  };

  const register = async (
    username: string, 
    password: string, 
    name?: string, 
    email?: string, 
    phone?: string
  ) => {
    try {
      await AuthService.register({ 
        username, 
        password, 
        name, 
        email, 
        phone 
      });
      // Optionally auto-login after registration
      return await login(username, password);
    } catch (error: any) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error.toString() 
      });
      return false;
    }
  };

  const logout = async () => {
    await AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const updatedUser = await AuthService.updateProfile(userData);
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: updatedUser 
      });
      return true;
    } catch (error: any) {
      console.error('Profile update failed', error);
      return false;
    }
  };
  const addBalance = async (amount: number) => {
    try {
      // Call the new AuthService method
      const updatedUser = await AuthService.addBalance(amount);
      // Dispatch UPDATE_USER with the full updated user object from backend
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser
      });
      return true; // Indicate success
    } catch (error: any) {
      console.error('Add balance failed:', error);
      // Optionally dispatch an error action
      // dispatch({ type: 'ADD_BALANCE_FAILURE', payload: error.toString() });
      return false; // Indicate failure
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AppContext.Provider 
      value={{ 
        state, 
        dispatch, 
        login, 
        register, 
        logout, 
        updateProfile,
        addBalance,
        clearError
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
