import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest, ApiError } from '../api/client';
import { STORAGE_KEYS } from '../constants';
import type { AuthResponse, AuthState, User } from '../model';

interface PatientRegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  registerPatient: (payload: PatientRegistrationPayload) => Promise<User>;
  logout: () => void;
  clearError: () => void;
}

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistSession(auth: AuthResponse) {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, auth.token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (!token) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    apiRequest<{ data: { user: User } }>('/auth/me')
      .then((response) => {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      });
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiRequest<{ data: AuthResponse }>('/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, password }),
      });

      persistSession(response.data);

      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return response.data.user;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Login failed';
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
      throw error;
    }
  };

  const registerPatient = async (payload: PatientRegistrationPayload) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiRequest<{ data: AuthResponse }>('/auth/patient-register', {
        method: 'POST',
        auth: false,
        body: JSON.stringify(payload),
      });

      persistSession(response.data);

      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return response.data.user;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Registration failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        registerPatient,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
