import { useState } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { useApiQuery } from '@hooks/useApiQuery';
import type { Appointment } from '@hooks/useDashboardData';
import { PatientHeader } from './PatientHeader';
import { PatientSidebar } from './PatientSidebar';
import { BookAppointmentModal } from '../../components/appointments/BookAppointmentModal';
import { Button } from '../../components/ui/Button';

interface ApiResponse<T> {
  data: T;
}

export function PatientAppointmentsPage() {
  const { user } = useAuth();
  const patientId = user?.patientProfile?._id || user?.patientProfile?.id;
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const { data, isLoading, error, refetch } = useApiQuery<Appointment[]>(
    patientId
      ? () =>
          apiRequest<ApiResponse<Appointment[]>>(`/appointments?patient=${patientId}&limit=100&sort=scheduledFor`).then(
            (response) => response.data
          )
      : null,
    [patientId]
  );

  const handleBookingSuccess = async (newAppointment?: { appointmentNumber?: string; scheduledFor?: string }) => {
    if (rescheduleTarget) {
      const noteParts = ['Rescheduled by patient'];
      if (newAppointment?.appointmentNumber) {
        noteParts.push(`New appointment: ${newAppointment.appointmentNumber}`);
      } else if (newAppointment?.scheduledFor) {
        noteParts.push(`New time: ${new Date(newAppointment.scheduledFor).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}`);
      }

      try {
        setIsCancelling(true);
        setActionError(null);
        setActionSuccess(null);
        await apiRequest(`/appointments/${rescheduleTarget._id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'cancelled',
            note: noteParts.join('. ')
          }),
        });
        setActionSuccess('Appointment rescheduled successfully.');
      } catch (submitError) {
        setActionError(submitError instanceof Error ? submitError.message : 'Failed to cancel the original appointment');
      } finally {
        setIsCancelling(false);
        setRescheduleTarget(null);
      }
    }

    refetch();
  };

  const handleCancel = async (appointmentId: string) => {
    const note = window.prompt('Reason for cancellation:');
    if (note === null) {
      return;
    }

    try {
      setIsCancelling(true);
      setActionError(null);
      setActionSuccess(null);
      await apiRequest(`/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'cancelled',
          note,
        }),
      });
      setActionSuccess('Appointment cancelled.');
      refetch();
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : 'Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-50 text-blue-700',
      confirmed: 'bg-green-50 text-green-700',
      'checked-in': 'bg-purple-50 text-purple-700',
      'in-progress': 'bg-yellow-50 text-yellow-700',
      completed: 'bg-emerald-50 text-emerald-700',
      cancelled: 'bg-red-50 text-red-700',
      'no-show': 'bg-slate-50 text-slate-700'
    };
    return colors[status] || 'bg-slate-50 text-slate-700';
  };

  const handleOpenBooking = () => {
    setRescheduleTarget(null);
    setActionError(null);
    setActionSuccess(null);
    setIsBookingModalOpen(true);
  };

  const handleOpenReschedule = (appointment: Appointment) => {
    setRescheduleTarget(appointment);
    setActionError(null);
    setActionSuccess(null);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PatientSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <PatientHeader />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
                <p className="text-slate-600 mt-1">Track past and upcoming visits in one place.</p>
              </div>
              <Button onClick={handleOpenBooking}>
                Book New Appointment
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {actionError && <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-100">{actionError}</div>}
              {actionSuccess && <div className="p-4 text-sm text-emerald-700 bg-emerald-50 border-b border-emerald-100">{actionSuccess}</div>}
              {isLoading && <div className="p-6 text-sm text-slate-500">Loading appointments...</div>}
              {error && <div className="p-6 text-sm text-red-600">{error}</div>}
              {data && data.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-slate-500 mb-4">You don't have any appointments yet.</p>
                  <Button onClick={handleOpenBooking}>
                    Book Your First Appointment
                  </Button>
                </div>
              )}
              {data && data.length > 0 && (
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Doctor</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">When</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Reason</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((appointment) => {
                      const scheduledDate = new Date(appointment.scheduledFor);
                      const isUpcoming = scheduledDate > new Date();
                      const canManage = isUpcoming && (appointment.status === 'scheduled' || appointment.status === 'confirmed');
                      const canCancel = canManage;
                      const canReschedule = canManage;

                      return (
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
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {canReschedule || canCancel ? (
                              <div className="flex items-center justify-end gap-2">
                                {canReschedule && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    disabled={isCancelling}
                                    onClick={() => handleOpenReschedule(appointment)}
                                  >
                                    Reschedule
                                  </Button>
                                )}
                                {canCancel && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    disabled={isCancelling}
                                    onClick={() => void handleCancel(appointment._id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">No actions</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setRescheduleTarget(null);
        }}
        onSuccess={handleBookingSuccess}
        mode={rescheduleTarget ? 'reschedule' : 'book'}
        initialDoctorId={rescheduleTarget?.doctor?._id}
        rescheduleMeta={{
          doctorName: rescheduleTarget?.doctor
            ? `Dr. ${rescheduleTarget.doctor.firstName ?? ''} ${rescheduleTarget.doctor.lastName ?? ''}`.trim()
            : undefined,
          scheduledFor: rescheduleTarget?.scheduledFor,
        }}
      />
    </div>
  );
}
