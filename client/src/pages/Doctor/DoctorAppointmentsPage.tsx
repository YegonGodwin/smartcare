import { useState } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { useApiQuery } from '@hooks/useApiQuery';
import { Button } from '@components/ui';
import type { Appointment } from '@hooks/useDashboardData';
import { DoctorHeader } from './DoctorHeader';
import { DoctorSidebar } from './DoctorSidebar';

interface ApiResponse<T> {
  data: T;
}

type AppointmentStatus = 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

export function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const doctorId = user?.doctorProfile?._id || user?.doctorProfile?.id;
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const { data, isLoading, error } = useApiQuery<Appointment[]>(
    doctorId
      ? () =>
          apiRequest<ApiResponse<Appointment[]>>(`/appointments?doctor=${doctorId}&limit=100&sort=scheduledFor`).then(
            (response) => response.data
          )
      : null,
    [doctorId, refreshKey]
  );

  const handleStatusChange = async (appointmentId: string, status: AppointmentStatus) => {
    let note = '';
    if (status === 'no-show') {
      const reason = window.prompt('Provide no-show reason:');
      if (reason === null) {
        return;
      }
      note = reason;
    }

    setActionError(null);
    setActionSuccess(null);

    try {
      await apiRequest(`/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      setActionSuccess(`Appointment marked as ${status}.`);
      setRefreshKey((prev) => prev + 1);
    } catch (statusError) {
      setActionError(statusError instanceof Error ? statusError.message : 'Failed to update appointment status');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'completed') return 'bg-emerald-50 text-emerald-700';
    if (status === 'cancelled' || status === 'no-show') return 'bg-red-50 text-red-700';
    if (status === 'in-progress' || status === 'checked-in') return 'bg-amber-50 text-amber-700';
    if (status === 'confirmed') return 'bg-indigo-50 text-indigo-700';
    return 'bg-blue-50 text-blue-700';
  };

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
              {actionError && <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
              {actionSuccess && <div className="mx-6 mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionSuccess}</div>}
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
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
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
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadgeClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {appointment.status === 'confirmed' && (
                              <Button type="button" size="sm" variant="secondary" onClick={() => void handleStatusChange(appointment._id, 'checked-in')}>
                                Check In
                              </Button>
                            )}
                            {appointment.status === 'checked-in' && (
                              <Button type="button" size="sm" variant="outline" onClick={() => void handleStatusChange(appointment._id, 'in-progress')}>
                                Start Visit
                              </Button>
                            )}
                            {appointment.status === 'in-progress' && (
                              <Button type="button" size="sm" variant="outline" onClick={() => void handleStatusChange(appointment._id, 'completed')}>
                                Complete
                              </Button>
                            )}
                            {(appointment.status === 'scheduled' ||
                              appointment.status === 'confirmed' ||
                              appointment.status === 'checked-in') && (
                              <Button type="button" size="sm" variant="ghost" onClick={() => void handleStatusChange(appointment._id, 'no-show')}>
                                No Show
                              </Button>
                            )}
                          </div>
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
