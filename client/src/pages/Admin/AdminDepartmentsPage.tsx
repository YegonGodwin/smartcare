import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { useApiQuery } from '@hooks/useApiQuery';
import type { Department } from '@hooks/useDashboardData';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface ApiResponse<T> {
  data: T;
}

export function AdminDepartmentsPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useApiQuery<Department[]>(
    () => apiRequest<ApiResponse<Department[]>>('/departments?limit=50&sort=name').then((response) => response.data),
    []
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Departments</h1>
              <p className="text-slate-600 mt-1">Operational departments registered in SmartCare.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {isLoading && <div className="p-6 text-sm text-slate-500">Loading departments...</div>}
              {error && <div className="p-6 text-sm text-red-600">{error}</div>}
              {data && (
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Code</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((department) => (
                      <tr key={department._id}>
                        <td className="px-6 py-4 font-semibold text-slate-800">{department.name}</td>
                        <td className="px-6 py-4 text-slate-600">{department.code}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${department.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {department.isActive !== false ? 'Active' : 'Inactive'}
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
