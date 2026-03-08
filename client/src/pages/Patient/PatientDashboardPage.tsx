import { useAuth } from '@hooks/index';
import { usePatientDashboardData } from '@hooks/useDashboardData';
import { PatientSidebar } from './PatientSidebar';
import { PatientHeader } from './PatientHeader';
import { PatientStats } from './PatientStats';
import { UpcomingAppointments } from './UpcomingAppointments';
import { HealthMetrics } from './HealthMetrics';
import { QuickActions } from './QuickActions';
import { MedicationReminders } from './MedicationReminders';
import { RecentActivity } from './RecentActivity';

export function PatientDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = usePatientDashboardData(user);
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const fullName = data?.patient ? `${data.patient.firstName} ${data.patient.lastName}` : `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const upcomingCount = data?.appointments.filter((appointment) => new Date(appointment.scheduledFor).getTime() >= Date.now()).length || 0;
  const labCount = data?.records.reduce((total, record) => total + (record.labResults?.length || 0), 0) || 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PatientSidebar user={user} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <PatientHeader />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Welcome Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-500/20">
              <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-10 -translate-y-10">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-white/20">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    Live Health Status: Connected
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                    {greeting}, {fullName || 'Patient'}
                  </h1>
                  <p className="text-emerald-50 text-lg font-medium opacity-90 max-w-md">
                    You have {upcomingCount} upcoming appointments and {labCount} lab results on record.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-8">
                    <button className="bg-white text-emerald-700 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-50 transition-all flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Book New Appointment
                    </button>
                    <button className="bg-emerald-500/30 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-500/40 transition-all">
                      View Records
                    </button>
                  </div>
                </div>
                
                <div className="hidden lg:block">
                  <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-inner">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Health Score</p>
                        <p className="text-2xl font-black">{data?.patient?.allergies?.length ? 88 : 92}/100</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="w-48 h-2 bg-emerald-900/30 rounded-full overflow-hidden">
                        <div className={`${data?.patient?.allergies?.length ? 'w-[88%]' : 'w-[92%]'} h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]`}></div>
                      </div>
                      <p className="text-emerald-100 text-[10px] font-medium italic">Top 5% for your age group</p>
                    </div>
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
                Loading patient dashboard...
              </div>
            )}

            {/* Quick Actions Grid */}
            <QuickActions />

            {/* Stats Row */}
            {data && <PatientStats patient={data.patient} appointments={data.appointments} records={data.records} />}

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Left & Middle: Main Feed */}
              <div className="xl:col-span-8 space-y-8">
                {data && <UpcomingAppointments appointments={data.appointments} />}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <MedicationReminders />
                  {data && <RecentActivity appointments={data.appointments} records={data.records} />}
                </div>
              </div>

              {/* Right: Metrics & Insights */}
              <div className="xl:col-span-4 space-y-8">
                {data && <HealthMetrics patient={data.patient} appointments={data.appointments} />}
                
                {/* Community/Health Tips Section */}
                <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Health Insights</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-blue-50 rounded-2xl group cursor-pointer hover:bg-blue-100 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-800">New Research</p>
                        <p className="text-xs text-blue-600 mt-1 leading-relaxed">Understanding the impact of sleep on cardiovascular health...</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 p-4 bg-purple-50 rounded-2xl group cursor-pointer hover:bg-purple-100 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-purple-800">Wellness Tip</p>
                        <p className="text-xs text-purple-600 mt-1 leading-relaxed">Meditation for 10 minutes a day can reduce stress by 25%...</p>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 py-3 text-slate-500 text-sm font-bold hover:text-slate-900 transition-colors flex items-center justify-center gap-2">
                    Browse All Articles
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
