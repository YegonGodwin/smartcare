import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { Button, Input } from '@components/ui';
import type { MedicalRecord } from '@hooks/useDashboardData';
import { DoctorHeader } from './DoctorHeader';
import { DoctorSidebar } from './DoctorSidebar';

interface ApiResponse<T> {
  data: T;
}

interface SimplePatient {
  _id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
}

interface SimpleAppointment {
  _id: string;
  appointmentNumber: string;
  scheduledFor: string;
  patient?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  } | null;
}

const initialForm = {
  patient: '',
  appointment: '',
  diagnosis: '',
  symptoms: '',
  treatmentPlan: '',
  notes: '',
  visitDate: new Date().toISOString().slice(0, 16),
  followUpDate: '',
};

export function DoctorRecordsPage() {
  const { user } = useAuth();
  const doctorId = user?.doctorProfile?._id || user?.doctorProfile?.id;
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<SimplePatient[]>([]);
  const [appointments, setAppointments] = useState<SimpleAppointment[]>([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    if (!doctorId) {
      setRecords([]);
      setPatients([]);
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [recordsResponse, patientsResponse, appointmentsResponse] = await Promise.all([
        apiRequest<ApiResponse<MedicalRecord[]>>(`/medical-records?doctor=${doctorId}&limit=100&sort=-visitDate`),
        apiRequest<ApiResponse<SimplePatient[]>>('/patients?limit=100&sort=firstName'),
        apiRequest<ApiResponse<SimpleAppointment[]>>(`/appointments?doctor=${doctorId}&limit=100&sort=-scheduledFor`),
      ]);

      setRecords(recordsResponse.data);
      setPatients(patientsResponse.data);
      setAppointments(appointmentsResponse.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load doctor record workflow');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [doctorId]);

  const visibleAppointments = form.patient
    ? appointments.filter((appointment) => appointment.patient?._id === form.patient)
    : appointments;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!doctorId) {
      setError('Doctor profile not found for the current account.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest('/medical-records', {
        method: 'POST',
        body: JSON.stringify({
          patient: form.patient,
          doctor: doctorId,
          appointment: form.appointment || undefined,
          diagnosis: form.diagnosis,
          symptoms: form.symptoms
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          treatmentPlan: form.treatmentPlan,
          notes: form.notes,
          visitDate: form.visitDate,
          followUpDate: form.followUpDate || undefined,
        }),
      });

      setForm({
        ...initialForm,
        visitDate: new Date().toISOString().slice(0, 16),
      });
      setSuccess('Medical record created successfully.');
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create medical record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <DoctorHeader user={user} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Medical Records</h1>
              <p className="text-slate-600 mt-1">Create consultation notes and review records authored under your profile.</p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <section className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">New Clinical Record</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient</label>
                    <select
                      value={form.patient}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          patient: e.target.value,
                          appointment: '',
                        }))
                      }
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
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Linked Appointment</label>
                    <select
                      value={form.appointment}
                      onChange={(e) => setForm((prev) => ({ ...prev, appointment: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                    >
                      <option value="">No linked appointment</option>
                      {visibleAppointments.map((appointment) => (
                        <option key={appointment._id} value={appointment._id}>
                          {appointment.appointmentNumber} - {appointment.patient?.firstName} {appointment.patient?.lastName} -{' '}
                          {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          }).format(new Date(appointment.scheduledFor))}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Diagnosis"
                    value={form.diagnosis}
                    onChange={(e) => setForm((prev) => ({ ...prev, diagnosis: e.target.value }))}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Symptoms</label>
                    <textarea
                      value={form.symptoms}
                      onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))}
                      className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                      placeholder="Fever, cough, headache"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Treatment Plan</label>
                    <textarea
                      value={form.treatmentPlan}
                      onChange={(e) => setForm((prev) => ({ ...prev, treatmentPlan: e.target.value }))}
                      className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                      placeholder="Medication, observation, referral, or procedure notes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Clinical Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                      className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                      placeholder="Additional notes, observations, or instructions"
                    />
                  </div>

                  <Input
                    label="Visit Date"
                    type="datetime-local"
                    value={form.visitDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, visitDate: e.target.value }))}
                    required
                  />

                  <Input
                    label="Follow Up Date"
                    type="datetime-local"
                    value={form.followUpDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, followUpDate: e.target.value }))}
                  />

                  {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                  {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

                  <Button type="submit" className="w-full" isLoading={isSubmitting}>
                    Save Medical Record
                  </Button>
                </form>
              </section>

              <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">Recent Clinical Records</h2>
                </div>
                {isLoading && <div className="p-6 text-sm text-slate-500">Loading medical records...</div>}
                {!isLoading && records.length === 0 && <div className="p-6 text-sm text-slate-500">No medical records found yet.</div>}
                {!isLoading && records.length > 0 && (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Diagnosis</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Visit Date</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Follow Up</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.map((record) => (
                        <tr key={record._id}>
                          <td className="px-6 py-4 font-semibold text-slate-800">
                            {record.patient?.firstName} {record.patient?.lastName}
                          </td>
                          <td className="px-6 py-4 text-slate-600">{record.diagnosis}</td>
                          <td className="px-6 py-4 text-slate-600">
                            {new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }).format(new Date(record.visitDate))}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {record.followUpDate
                              ? new Intl.DateTimeFormat('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }).format(new Date(record.followUpDate))
                              : 'Not scheduled'}
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
