import { useState } from 'react';
import { useAuth } from '@hooks/index';
import { useSystemLogs } from '@hooks/useSystemLogs';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Card } from '@components/ui/Card';

export function SystemLogsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    category: '',
    status: '',
    action: '',
  });

  const { logs, pagination, isLoading, error, refetch } = useSystemLogs(filters);

  const categories = ['AUTH', 'USER', 'APPOINTMENT', 'MEDICAL_RECORD', 'DEPARTMENT', 'DOCTOR', 'SYSTEM', 'PATIENT'];
  const statuses = ['SUCCESS', 'FAILURE', 'INFO', 'WARNING', 'ERROR'];

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'FAILURE':
      case 'ERROR': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'WARNING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'INFO': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={user} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Audit Logs</h1>
                <p className="text-slate-500 font-medium mt-1">Track and monitor all system activities and security events.</p>
              </div>
              <button 
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Logs
              </button>
            </div>

            {/* Filters */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="">All Statuses</option>
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Search Action</label>
                  <input
                    type="text"
                    name="action"
                    placeholder="e.g. LOGIN"
                    value={filters.action}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="flex items-end">
                   <button 
                    onClick={() => setFilters({ page: 1, limit: 20, category: '', status: '', action: '' })}
                    className="w-full py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </Card>

            {/* Logs Table */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading system logs...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-rose-500 font-medium">
                          {error}
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                          No logs found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {log.user ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">{log.user.firstName} {log.user.lastName}</span>
                                <span className="text-xs text-slate-500">{log.user.email}</span>
                              </div>
                            ) : (
                              <span className="text-sm italic text-slate-400">System/Anonymous</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-tight">
                              {log.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-700">{log.action}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-tight ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600 line-clamp-1 group-hover:line-clamp-none max-w-md transition-all">
                              {log.description}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-sm text-slate-500 font-medium">
                    Showing <span className="font-bold text-slate-700">{logs.length}</span> of <span className="font-bold text-slate-700">{pagination.total}</span> logs
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={filters.page === 1}
                      onClick={() => handlePageChange(filters.page - 1)}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-sm font-bold text-slate-700 px-3">
                      Page {filters.page} of {pagination.pages}
                    </span>
                    <button
                      disabled={filters.page === pagination.pages}
                      onClick={() => handlePageChange(filters.page + 1)}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
