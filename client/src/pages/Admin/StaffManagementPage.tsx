import { useState } from 'react';
import { useAuth } from '@hooks/index';
import { useUsers } from '@hooks/useUsers';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';

export function StaffManagementPage() {
  const { user: currentUser } = useAuth();
  const { staff, isLoading, error, updateAccess, deleteUserAccount } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const roles = ['admin', 'doctor', 'receptionist'];

  const filteredStaff = staff.filter(s => {
    const matchesSearch = 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === '' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleStatusToggle = async (user: any) => {
    const result = await updateAccess(user._id || user.id, { isActive: !user.isActive });
    if (!result.success) alert(result.error);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const result = await updateAccess(userId, { role: newRole });
    if (!result.success) alert(result.error);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this staff account?')) {
      const result = await deleteUserAccount(userId);
      if (!result.success) alert(result.error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={currentUser} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={currentUser} />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff & Access Control</h1>
                <p className="text-slate-500 font-medium mt-1">Manage hospital personnel roles, permissions, and account statuses.</p>
              </div>
            </div>

            {/* Filters */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Search Personnel</label>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="">All Staff Roles</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Staff Table */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Staff Member</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Current Role</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading staff data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-rose-500 font-medium">{error}</td>
                      </tr>
                    ) : filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No staff members found.</td>
                      </tr>
                    ) : (
                      filteredStaff.map((s: any) => (
                        <tr key={s._id || s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                {s.firstName[0]}{s.lastName[0]}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">{s.firstName} {s.lastName}</span>
                                <span className="text-xs text-slate-500">{s.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={s.role}
                              disabled={s._id === currentUser?._id}
                              onChange={(e) => handleRoleChange(s._id || s.id, e.target.value)}
                              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              {roles.map(r => (
                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              disabled={s._id === currentUser?._id}
                              onClick={() => handleStatusToggle(s)}
                              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                s.isActive 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                                  : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                              } disabled:opacity-50`}
                            >
                              {s.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600 font-medium">
                              {s.department?.name || 'Unassigned'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                className="px-3 py-1.5 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                disabled={s._id === currentUser?._id}
                                onClick={() => handleDelete(s._id || s.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
