import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { useApiQuery } from '@hooks/useApiQuery';
import type { Appointment } from '@hooks/useDashboardData';
import { PatientHeader } from './PatientHeader';
import { PatientSidebar } from './PatientSidebar';

interface ApiResponse<T> {
  data: T;
}

export function PatientAppointmentsPage() {
  const { user } = useAuth();
  const patientId = user?.patientProfile?._id || user?.patientProfile?.id;
  const { data, isLoading, error } = useApiQuery<Appointment[]>(
    patientId
      ? () =>
          apiRequest<ApiResponse<Appointment[]>>(`/appointments?patient=${patientId}&limit=100&sort=scheduledFor`).then(
            (response) => response.data
          )
      : null,
    [patientId]
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PatientSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <PatientHeader />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
              <p className="text-slate-600 mt-1">Track past and upcoming visits in one place.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {isLoading && <div className="p-6 text-sm text-slate-500">Loading appointments...</div>}
              {error && <div className="p-6 text-sm text-red-600">{error}</div>}
              {data && (
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Doctor</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">When</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Reason</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((appointment) => (
                      <tr key={appointment._id}>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          }).format(new Date(appointment.scheduledFor))}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{appointment.reason}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 capitalize">
                            {appointment.status}
                          </span>
                        </td>
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
