import { useAuth } from '@hooks/index';
import { usePatientDashboardData } from '@hooks/useDashboardData';
import { PatientSidebar } from './PatientSidebar';
import { PatientHeader } from './PatientHeader';
import { PatientStats } from './PatientStats';
import { UpcomingAppointments } from './UpcomingAppointments';
import { HealthMetrics } from './HealthMetrics';
import { QuickActions } from './QuickActions';
import { LabResultsRepository } from './LabResultsRepository';
import { PrescriptionManager } from './PrescriptionManager';

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
            <div className="relative overflow-hidden bg-[#064e3b] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-900/20">
              <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-10 -translate-y-10">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    System Protocol: Secure Connection
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                    {greeting}, {fullName || 'Patient'}
                  </h1>
                  <p className="text-emerald-50/80 text-lg font-medium max-w-md leading-relaxed">
                    Overviewing {upcomingCount} active schedules and {labCount} laboratory assessments within your medical profile.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-8">
                    <button className="bg-white text-[#064e3b] px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-black/10 hover:bg-emerald-50 transition-all flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Book New Appointment
                    </button>
                    <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3.5 rounded-2xl font-bold hover:bg-white/20 transition-all text-sm">
                      View Clinical History
                    </button>
                  </div>
                </div>
                
                <div className="hidden lg:block shrink-0">
                  <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-inner w-72">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-900 shadow-lg border border-emerald-50">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-widest">Trust Index</p>
                        <p className="text-3xl font-black">{data?.patient?.allergies?.length ? 94 : 98}%</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="w-full h-1.5 bg-emerald-950/40 rounded-full overflow-hidden">
                        <div className={`${data?.patient?.allergies?.length ? 'w-[94%]' : 'w-[98%]'} h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]`}></div>
                      </div>
                      <p className="text-emerald-100/40 text-[9px] font-black uppercase tracking-widest text-center">Verified Patient Profile</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 flex items-center gap-4 font-bold italic">
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                {error}
              </div>
            )}

            {/* Quick Actions Grid */}
            <QuickActions />

            {/* Stats Row */}
            {data && <PatientStats patient={data.patient} appointments={data.appointments} records={data.records} />}

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Left & Middle: Main Clinical Modules */}
              <div className="xl:col-span-8 space-y-8">
                {data && <UpcomingAppointments appointments={data.appointments} />}
                
                <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                  {data && <LabResultsRepository records={data.records} />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                  {data && <PrescriptionManager records={data.records} />}
                </div>
              </div>

              {/* Right: Metrics & Health Governance */}
              <div className="xl:col-span-4 space-y-8">
                {data && <HealthMetrics patient={data.patient} appointments={data.appointments} />}
                
                {/* Health Coverage Mockup - Adds Maturity */}
                <div className="bg-[#0f172a] rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                    Health Coverage
                  </h3>
                  
                  <div className="space-y-6 relative z-10">
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Current Provider</p>
                      <p className="text-lg font-bold">Standard Health Assurance</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Plan Type</p>
                        <p className="text-sm font-bold">Platinum Premium</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">Active</p>
                      </div>
                    </div>
                    
                    <button className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all">
                      View Coverage Details
                    </button>
                  </div>
                </div>

                {/* Insight Module */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    Governance & Tips
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Medical Research</p>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">Annual wellness checkups reduce long-term health risks by 35%.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
