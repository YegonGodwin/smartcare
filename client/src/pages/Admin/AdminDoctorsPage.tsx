import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { Button, Input } from '@components/ui';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface ApiResponse<T> {
  data: T;
}

interface DepartmentItem {
  _id: string;
  name: string;
  code: string;
}

interface DoctorItem {
  _id: string;
  staffId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  status: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  department?: {
    _id?: string;
    name?: string;
    code?: string;
  } | null;
}

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialization: '',
  department: '',
  licenseNumber: '',
  yearsOfExperience: '',
  consultationFee: '',
  status: 'active',
  password: '',
};

export function AdminDoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [doctorsResponse, departmentsResponse] = await Promise.all([
        apiRequest<ApiResponse<DoctorItem[]>>('/doctors?limit=100&sort=firstName'),
        apiRequest<ApiResponse<DepartmentItem[]>>('/departments?limit=100&sort=name'),
      ]);

      setDoctors(doctorsResponse.data);
      setDepartments(departmentsResponse.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load doctor data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const yearsOfExperience = form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined;
    const consultationFee = form.consultationFee ? Number(form.consultationFee) : undefined;

    try {
      await apiRequest('/doctors/onboard', {
        method: 'POST',
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          specialization: form.specialization,
          department: form.department,
          licenseNumber: form.licenseNumber,
          yearsOfExperience,
          consultationFee,
          status: form.status,
          password: form.password,
        }),
      });

      setForm(initialForm);
      setSuccess('Doctor onboarded successfully.');
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to onboard doctor');
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
              <h1 className="text-3xl font-bold text-slate-900">Doctor Onboarding</h1>
              <p className="text-slate-600 mt-1">Create doctor profiles with login access in one workflow.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <section className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">New Doctor</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input label="First Name" value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} required />
                  <Input label="Last Name" value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} required />
                  <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
                  <Input label="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} required />
                  <Input label="Specialization" value={form.specialization} onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))} required />
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
                  <Input label="License Number" value={form.licenseNumber} onChange={(e) => setForm((prev) => ({ ...prev, licenseNumber: e.target.value }))} required />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Years of Experience"
                      type="number"
                      min="0"
                      value={form.yearsOfExperience}
                      onChange={(e) => setForm((prev) => ({ ...prev, yearsOfExperience: e.target.value }))}
                    />
                    <Input
                      label="Consultation Fee"
                      type="number"
                      min="0"
                      value={form.consultationFee}
                      onChange={(e) => setForm((prev) => ({ ...prev, consultationFee: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                    >
                      <option value="active">Active</option>
                      <option value="on-leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <Input
                    label="Temporary Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />

                  {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                  {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

                  <Button type="submit" className="w-full" isLoading={isSubmitting}>
                    Onboard Doctor
                  </Button>
                </form>
              </section>

              <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">Doctor Directory</h2>
                </div>
                {isLoading ? (
                  <div className="p-6 text-sm text-slate-500">Loading doctors...</div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Doctor</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {doctors.map((doctor) => (
                        <tr key={doctor._id}>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">Dr. {doctor.firstName} {doctor.lastName}</div>
                            <div className="text-xs text-slate-500">{doctor.specialization}</div>
                            <div className="text-xs text-slate-400">{doctor.staffId || 'Staff ID pending'}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <div>{doctor.department?.name || 'Unassigned'}</div>
                            <div className="text-xs text-slate-400">{doctor.department?.code || ''}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <div>{doctor.phone}</div>
                            <div className="text-xs text-slate-500">{doctor.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 capitalize">
                              {doctor.status}
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
