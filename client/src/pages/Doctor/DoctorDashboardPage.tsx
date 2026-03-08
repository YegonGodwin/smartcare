import { useAuth } from '@hooks/index';
import { useDoctorDashboardData } from '@hooks/useDashboardData';
import { DoctorSidebar } from './DoctorSidebar';
import { DoctorHeader } from './DoctorHeader';
import { DoctorStats } from './DoctorStats';
import { UpcomingAppointments } from './UpcomingAppointments';
import { PatientActivity } from './PatientActivity';

export function DoctorDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useDoctorDashboardData(user);
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const displayName = data?.doctor ? `Dr. ${data.doctor.firstName} ${data.doctor.lastName}` : `Dr. ${user?.lastName || 'Doctor'}`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar user={user} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <DoctorHeader user={user} />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{greeting}, {displayName}</h1>
                <p className="text-slate-600 mt-1">Here is what's happening with your practice today.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())}</span>
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
                Loading doctor dashboard...
              </div>
            )}

            {/* Stats Grid */}
            {data && <DoctorStats appointments={data.appointments} records={data.records} />}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Appointments */}
              <div className="lg:col-span-2 space-y-8">
                {data && <UpcomingAppointments appointments={data.appointments} />}
                
                {/* Schedule Overview Placeholder */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                    <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                    </svg>
                  </div>
                  <div className="relative z-10 max-w-md">
                    <h3 className="text-2xl font-bold mb-2">Manage Your Schedule</h3>
                    <p className="text-blue-100 mb-6">Easily update your availability, block time for surgeries, or set up virtual consultation hours.</p>
                    <button className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                      Open Scheduler
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Recent Activity */}
              <div className="lg:col-span-1">
                {data && <PatientActivity records={data.records} />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
