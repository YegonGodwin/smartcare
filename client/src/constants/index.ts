export const APP_NAME = 'SmartCare Hospital Management System';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'SmartCare Systems';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'smartcare_auth_token',
  REMEMBER_ME: 'smartcare_remember_me',
  USER_PREFERENCES: 'smartcare_preferences',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  APPOINTMENTS: '/appointments',
  SETTINGS: '/settings',
} as const;

export const SYSTEM_STATUS = {
  OPERATIONAL: 'All systems operational',
  DEGRADED: 'Some services degraded',
  DOWN: 'System maintenance',
} as const;
