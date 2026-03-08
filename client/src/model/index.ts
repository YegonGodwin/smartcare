export type Role = 'patient' | 'doctor' | 'admin' | 'receptionist';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  patientProfile?: {
    _id?: string;
    id?: string;
    patientNumber?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
  } | null;
  doctorProfile?: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    specialization?: string;
  } | null;
}

export interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
