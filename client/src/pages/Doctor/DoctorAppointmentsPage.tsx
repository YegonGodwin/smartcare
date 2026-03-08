import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { useApiQuery } from '@hooks/useApiQuery';
import type { Appointment } from '@hooks/useDashboardData';
import { DoctorHeader } from './DoctorHeader';
import { DoctorSidebar } from './DoctorSidebar';

interface ApiResponse<T> {
  data: T;
}

export function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const doctorId = user?.doctorProfile?._id || user?.doctorProfile?.id;
  const { data, isLoading, error } = useApiQuery<Appointment[]>(
    doctorId
      ? () =>
          apiRequest<ApiResponse<Appointment[]>>(`/appointments?doctor=${doctorId}&limit=100&sort=scheduledFor`).then(
            (response) => response.data
          )
      : null,
    [doctorId]
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <DoctorHeader user={user} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
              <p className="text-slate-600 mt-1">Your scheduled consultations and follow-up visits.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {isLoading && <div className="p-6 text-sm text-slate-500">Loading appointments...</div>}
              {error && <div className="p-6 text-sm text-red-600">{error}</div>}
              {data && (
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">When</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((appointment) => (
                      <tr key={appointment._id}>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
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
                        <td className="px-6 py-4 text-slate-600 capitalize">{appointment.type}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 capitalize">
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
