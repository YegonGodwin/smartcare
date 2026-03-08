import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import type { User } from '../model';

interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
  };
}

interface Department {
  _id: string;
  id?: string;
  name: string;
  code: string;
  isActive?: boolean;
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  department?: {
    _id?: string;
    id?: string;
    name?: string;
    code?: string;
  } | null;
}

interface PatientProfile {
  _id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
  phone?: string;
  email?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface Appointment {
  _id: string;
  appointmentNumber: string;
  scheduledFor: string;
  status: string;
  type: string;
  reason: string;
  patient?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    patientNumber?: string;
  } | null;
  doctor?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    specialization?: string;
  } | null;
  department?: {
    _id?: string;
    name?: string;
    code?: string;
  } | null;
  vitals?: {
    bloodPressure?: string;
    temperature?: string;
    pulseRate?: string;
    weight?: string;
  };
}

interface MedicalRecord {
  _id: string;
  diagnosis: string;
  visitDate: string;
  followUpDate?: string;
  symptoms?: string[];
  prescriptions?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  labResults?: Array<{
    testName: string;
    result: string;
    unit?: string;
  }>;
  patient?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  doctor?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    specialization?: string;
  } | null;
}

interface DashboardSummary {
  totals: {
    patients: number;
    doctors: number;
    departments: number;
    medicalRecords: number;
    todayAppointments: number;
  };
  upcomingAppointments: Appointment[];
}

interface DashboardQueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface AdminDashboardData {
  summary: DashboardSummary;
  departments: Department[];
  doctors: Doctor[];
}

interface DoctorDashboardData {
  doctor: Doctor | null;
  appointments: Appointment[];
  records: MedicalRecord[];
}

interface PatientDashboardData {
  patient: PatientProfile | null;
  appointments: Appointment[];
  records: MedicalRecord[];
}

function usePollingLoader<T>(loadData: (() => Promise<T | null>) | null, deps: unknown[], intervalMs = 60000): DashboardQueryState<T> {
  const [state, setState] = useState<DashboardQueryState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!loadData) {
      setState({
        data: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    let disposed = false;

    const run = async (showLoading: boolean) => {
      if (showLoading) {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
      }

      try {
        const result = await loadData();
        if (!disposed) {
          setState({
            data: result,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!disposed) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load dashboard data',
          }));
        }
      }
    };

    void run(true);
    const timer = window.setInterval(() => {
      void run(false);
    }, intervalMs);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, deps);

  return state;
}

export function useAdminDashboardData() {
  return usePollingLoader<AdminDashboardData>(
    async () => {
      const [summaryResponse, departmentsResponse, doctorsResponse] = await Promise.all([
        apiRequest<ApiResponse<DashboardSummary>>('/dashboard/summary'),
        apiRequest<ApiResponse<Department[]>>('/departments?limit=50&sort=name'),
        apiRequest<ApiResponse<Doctor[]>>('/doctors?limit=100&sort=firstName'),
      ]);

      return {
        summary: summaryResponse.data,
        departments: departmentsResponse.data,
        doctors: doctorsResponse.data,
      };
    },
    []
  );
}

export function useDoctorDashboardData(user: User | null) {
  const doctorId = user?.doctorProfile?._id || user?.doctorProfile?.id;

  return usePollingLoader<DoctorDashboardData>(
    doctorId
      ? async () => {
          const [doctorResponse, appointmentsResponse, recordsResponse] = await Promise.all([
            apiRequest<ApiResponse<Doctor>>(`/doctors/${doctorId}`),
            apiRequest<ApiResponse<Appointment[]>>(`/appointments?doctor=${doctorId}&limit=20&sort=scheduledFor`),
            apiRequest<ApiResponse<MedicalRecord[]>>(`/medical-records?doctor=${doctorId}&limit=10&sort=-visitDate`),
          ]);

          return {
            doctor: doctorResponse.data,
            appointments: appointmentsResponse.data,
            records: recordsResponse.data,
          };
        }
      : null,
    [doctorId]
  );
}

export function usePatientDashboardData(user: User | null) {
  const patientId = user?.patientProfile?._id || user?.patientProfile?.id;

  return usePollingLoader<PatientDashboardData>(
    patientId
      ? async () => {
          const [patientResponse, appointmentsResponse, recordsResponse] = await Promise.all([
            apiRequest<ApiResponse<PatientProfile>>(`/patients/${patientId}`),
            apiRequest<ApiResponse<Appointment[]>>(`/appointments?patient=${patientId}&limit=20&sort=scheduledFor`),
            apiRequest<ApiResponse<MedicalRecord[]>>(`/medical-records?patient=${patientId}&limit=10&sort=-visitDate`),
          ]);

          return {
            patient: patientResponse.data,
            appointments: appointmentsResponse.data,
            records: recordsResponse.data,
          };
        }
      : null,
    [patientId]
  );
}

export type {
  AdminDashboardData,
  Appointment,
  DashboardSummary,
  Department,
  Doctor,
  MedicalRecord,
  PatientDashboardData,
  PatientProfile,
};
