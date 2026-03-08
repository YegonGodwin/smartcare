import { useAuth } from '@hooks/index';
import { useAdminDashboardData } from '@hooks/useDashboardData';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { SystemMetrics } from './SystemMetrics';
import { DepartmentStats } from './DepartmentStats';
import { ResourceMonitoring } from './ResourceMonitoring';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useAdminDashboardData();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={user} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Top Bar with Title and Date */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Health System Overview</h1>
                <p className="text-slate-500 font-medium mt-1">Real-time data for SmartCare Hospital Infrastructure.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reporting Date</span>
                    <span className="text-sm font-bold text-slate-800">
                      {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {isLoading && !data && (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-500">
                Loading live dashboard data...
              </div>
            )}

            {/* Core Metrics */}
            {data && <SystemMetrics summary={data.summary.totals} />}

            {/* Main Operational Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Detailed Unit Statistics */}
              <div className="xl:col-span-3">
                {data && <DepartmentStats departments={data.departments} doctors={data.doctors} />}
                
                {/* Secondary Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                   <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
                      <h4 className="text-lg font-bold mb-2">Staff Availability</h4>
                      <div className="flex items-end justify-between mb-4">
                        <span className="text-4xl font-bold">92%</span>
                        <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-lg">On Schedule</span>
                      </div>
                      <p className="text-indigo-100 text-sm mb-6 leading-relaxed">System tracking 450+ medical staff across all departments for current shift rotation.</p>
                      <button className="w-full py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                        Manage Staff Rotas
                      </button>
                   </div>
                   
                   <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20 border border-slate-800">
                      <h4 className="text-lg font-bold mb-2">Pharmacy Inventory</h4>
                      <div className="flex items-end justify-between mb-4">
                        <span className="text-4xl font-bold text-emerald-400">Stable</span>
                        <span className="text-sm font-medium bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg">8,400 SKU</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-6 leading-relaxed">Essential medicine stock levels are within optimal range for the current fiscal quarter.</p>
                      <button className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
                        Inventory Audit
                      </button>
                   </div>
                </div>
              </div>

              {/* Sidebar Info/Alerts */}
              <div className="xl:col-span-1">
                {data && <ResourceMonitoring summary={data.summary} />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
