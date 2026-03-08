import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { useApiQuery } from '@hooks/useApiQuery';
import type { PatientProfile } from '@hooks/useDashboardData';
import { DoctorHeader } from './DoctorHeader';
import { DoctorSidebar } from './DoctorSidebar';

interface ApiResponse<T> {
  data: T;
}

export function DoctorPatientsPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useApiQuery<PatientProfile[]>(
    () => apiRequest<ApiResponse<PatientProfile[]>>('/patients?limit=100&sort=firstName').then((response) => response.data),
    []
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <DoctorHeader user={user} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Patients</h1>
              <p className="text-slate-600 mt-1">Browse active patient profiles and identifiers.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {isLoading && <div className="p-6 text-sm text-slate-500">Loading patients...</div>}
              {error && <div className="p-6 text-sm text-red-600">{error}</div>}
              {data && (
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient No.</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((patient) => (
                      <tr key={patient._id}>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {patient.firstName} {patient.lastName}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{patient.patientNumber}</td>
                        <td className="px-6 py-4 text-slate-600">{patient.emergencyContact?.phone || 'No emergency contact'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
