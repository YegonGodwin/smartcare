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
  patient?: { firstName?: string; lastName?: string } | null;
  doctor?: { firstName?: string; lastName?: string } | null;
  department?: { name?: string } | null;
}

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
      await apiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setForm(initialForm);
      setSuccess('Appointment created successfully.');
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
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
                <h2 className="text-xl font-bold text-slate-900 mb-6">Book Appointment</h2>
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
                    Create Appointment
                  </Button>
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
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 capitalize">
                              {appointment.status}
                            </span>
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
