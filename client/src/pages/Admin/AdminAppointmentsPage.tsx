import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { Button, Input } from '@components/ui';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface ApiResponse<T> {
  data: T;
}

interface SimplePatient {
  _id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
}

interface SimpleDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  department?: { _id?: string; name?: string } | null;
}

interface SimpleDepartment {
  _id: string;
  name: string;
  code: string;
}

interface AppointmentItem {
  _id: string;
  scheduledFor: string;
  type: string;
  reason: string;
  status: string;
  patient?: { _id?: string; firstName?: string; lastName?: string } | null;
  doctor?: { _id?: string; firstName?: string; lastName?: string } | null;
  department?: { _id?: string; name?: string } | null;
}

type AppointmentStatus = 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

const initialForm = {
  patient: '',
  doctor: '',
  department: '',
  scheduledFor: '',
  reason: '',
  type: 'consultation',
};

export function AdminAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [patients, setPatients] = useState<SimplePatient[]>([]);
  const [doctors, setDoctors] = useState<SimpleDoctor[]>([]);
  const [departments, setDepartments] = useState<SimpleDepartment[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [appointmentsResponse, patientsResponse, doctorsResponse, departmentsResponse] = await Promise.all([
        apiRequest<ApiResponse<AppointmentItem[]>>('/appointments?limit=100&sort=scheduledFor'),
        apiRequest<ApiResponse<SimplePatient[]>>('/patients?limit=100&sort=firstName'),
        apiRequest<ApiResponse<SimpleDoctor[]>>('/doctors?limit=100&sort=firstName'),
        apiRequest<ApiResponse<SimpleDepartment[]>>('/departments?limit=100&sort=name'),
      ]);

      setAppointments(appointmentsResponse.data);
      setPatients(patientsResponse.data);
      setDoctors(doctorsResponse.data);
      setDepartments(departmentsResponse.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load appointment workflow data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find((item) => item._id === doctorId);

    setForm((prev) => ({
      ...prev,
      doctor: doctorId,
      department: doctor?.department?._id || prev.department,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest(editingAppointmentId ? `/appointments/${editingAppointmentId}` : '/appointments', {
        method: editingAppointmentId ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });

      setForm(initialForm);
      setEditingAppointmentId(null);
      setSuccess(editingAppointmentId ? 'Appointment updated successfully.' : 'Appointment created successfully.');
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (appointment: AppointmentItem) => {
    setEditingAppointmentId(appointment._id);
    setSuccess(null);
    setError(null);
    setForm({
      patient: appointment.patient?._id || '',
      doctor: appointment.doctor?._id || '',
      department: appointment.department?._id || '',
      scheduledFor: appointment.scheduledFor ? new Date(appointment.scheduledFor).toISOString().slice(0, 16) : '',
      reason: appointment.reason,
      type: appointment.type,
    });
  };

  const handleDelete = async (appointmentId: string) => {
    const note = window.prompt('Provide cancellation reason:');
    if (note === null) {
      return;
    }

    try {
      await handleStatusChange(appointmentId, 'cancelled', note);
      if (editingAppointmentId === appointmentId) {
        setEditingAppointmentId(null);
        setForm(initialForm);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to cancel appointment');
    }
  };

  const handleStatusChange = async (appointmentId: string, status: AppointmentStatus, note?: string) => {
    setError(null);
    setSuccess(null);

    await apiRequest(`/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        note,
      }),
    });

    setSuccess(`Appointment marked as ${status}.`);
    await loadData();
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
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Appointment Management</h1>
              <p className="text-slate-600 mt-1">Book appointments and monitor the clinic schedule.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <section className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  {editingAppointmentId ? 'Reschedule Appointment' : 'Book Appointment'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient</label>
                    <select
                      value={form.patient}
                      onChange={(e) => setForm((prev) => ({ ...prev, patient: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                      required
                    >
                      <option value="">Select patient</option>
                      {patients.map((patient) => (
                        <option key={patient._id} value={patient._id}>
                          {patient.firstName} {patient.lastName} ({patient.patientNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Doctor</label>
                    <select
                      value={form.doctor}
                      onChange={(e) => handleDoctorChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                      required
                    >
                      <option value="">Select doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map((department) => (
                        <option key={department._id} value={department._id}>
                          {department.name} ({department.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Scheduled For"
                    type="datetime-local"
                    value={form.scheduledFor}
                    onChange={(e) => setForm((prev) => ({ ...prev, scheduledFor: e.target.value }))}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="review">Review</option>
                      <option value="emergency">Emergency</option>
                      <option value="lab">Lab</option>
                      <option value="procedure">Procedure</option>
                    </select>
                  </div>

                  <Input label="Reason" value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} required />

                  {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                  {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

                  <Button type="submit" className="w-full" isLoading={isSubmitting}>
                    {editingAppointmentId ? 'Save Changes' : 'Create Appointment'}
                  </Button>
                  {editingAppointmentId && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        setEditingAppointmentId(null);
                        setForm(initialForm);
                        setError(null);
                        setSuccess(null);
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </form>
              </section>

              <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">Clinic Schedule</h2>
                </div>
                {isLoading ? (
                  <div className="p-6 text-sm text-slate-500">Loading appointments...</div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Doctor</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">When</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.map((appointment) => (
                        <tr key={appointment._id}>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">
                              {appointment.patient?.firstName} {appointment.patient?.lastName}
                            </div>
                            <div className="text-xs text-slate-500 capitalize">{appointment.type}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                            <div className="text-xs text-slate-500">{appointment.department?.name || 'Department pending'}</div>
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
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadgeClass(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                                <Button type="button" size="sm" variant="secondary" onClick={() => handleEdit(appointment)}>
                                  Edit
                                </Button>
                              )}
                              {appointment.status === 'scheduled' && (
                                <Button type="button" size="sm" variant="outline" onClick={() => void handleStatusChange(appointment._id, 'confirmed')}>
                                  Confirm
                                </Button>
                              )}
                              {(appointment.status === 'scheduled' ||
                                appointment.status === 'confirmed' ||
                                appointment.status === 'checked-in' ||
                                appointment.status === 'in-progress') && (
                                <Button type="button" size="sm" variant="ghost" onClick={() => void handleDelete(appointment._id)}>
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
