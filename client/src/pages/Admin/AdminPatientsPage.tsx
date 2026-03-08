import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { Button, Input } from '@components/ui';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface ApiResponse<T> {
  data: T;
}

interface PatientItem {
  _id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email?: string;
  status: string;
}

const initialForm = {
  firstName: '',
  lastName: '',
  gender: 'male',
  dateOfBirth: '',
  phone: '',
  email: '',
  address: '',
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
};

export function AdminPatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const loadPatients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<ApiResponse<PatientItem[]>>('/patients?limit=100&sort=-createdAt');
      setPatients(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPatients();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest('/patients', {
        method: 'POST',
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          phone: form.phone,
          email: form.email || undefined,
          address: form.address,
          emergencyContact: {
            name: form.emergencyContactName,
            relationship: form.emergencyContactRelationship,
            phone: form.emergencyContactPhone,
          },
        }),
      });

      setForm(initialForm);
      setSuccess('Patient created successfully.');
      await loadPatients();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create patient');
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
              <h1 className="text-3xl font-bold text-slate-900">Patient Registration</h1>
              <p className="text-slate-600 mt-1">Create patient profiles and manage the active patient registry.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <section className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">New Patient</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input label="First Name" value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} required />
                  <Input label="Last Name" value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} required />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))} required />
                  <Input label="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} required />
                  <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
                  <Input label="Address" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
                  <Input label="Emergency Contact Name" value={form.emergencyContactName} onChange={(e) => setForm((prev) => ({ ...prev, emergencyContactName: e.target.value }))} required />
                  <Input label="Emergency Contact Relationship" value={form.emergencyContactRelationship} onChange={(e) => setForm((prev) => ({ ...prev, emergencyContactRelationship: e.target.value }))} required />
                  <Input label="Emergency Contact Phone" value={form.emergencyContactPhone} onChange={(e) => setForm((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))} required />

                  {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                  {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

                  <Button type="submit" className="w-full" isLoading={isSubmitting}>
                    Create Patient
                  </Button>
                </form>
              </section>

              <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">Patient Registry</h2>
                </div>
                {isLoading ? (
                  <div className="p-6 text-sm text-slate-500">Loading patients...</div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient No.</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patients.map((patient) => (
                        <tr key={patient._id}>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{patient.firstName} {patient.lastName}</div>
                            <div className="text-xs text-slate-500 capitalize">{patient.gender}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{patient.patientNumber}</td>
                          <td className="px-6 py-4 text-slate-600">
                            <div>{patient.phone}</div>
                            <div className="text-xs text-slate-500">{patient.email || 'No email'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 capitalize">
                              {patient.status}
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
