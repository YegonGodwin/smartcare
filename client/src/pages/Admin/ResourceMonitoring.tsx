import type { DashboardSummary } from '@hooks/useDashboardData';

interface ResourceMonitoringProps {
  summary: DashboardSummary;
}

function getRelativeTime(value: string) {
  const delta = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(delta / 60000);

  if (minutes < 1) {
    return 'just now';
  }

  if (minutes < 60) {
    return `${minutes} mins ago`;
  }

  return `${Math.floor(minutes / 60)} hours ago`;
}

export function ResourceMonitoring({ summary }: ResourceMonitoringProps) {
  const alerts = summary.upcomingAppointments.slice(0, 3).map((appointment, index) => ({
    type: index === 0 ? 'Next Up' : 'Scheduled',
    title: `${appointment.patient?.firstName || 'Patient'} ${appointment.patient?.lastName || ''} with Dr. ${appointment.doctor?.lastName || 'Assigned'}`.trim(),
    time: getRelativeTime(appointment.scheduledFor),
    accent: index === 0 ? 'bg-rose-500' : index === 1 ? 'bg-amber-500' : 'bg-indigo-500',
    text: index === 0 ? 'text-rose-600' : index === 1 ? 'text-amber-600' : 'text-indigo-600',
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Resource Alerts</h3>
        <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
      </div>
      <div className="p-6 flex-1 space-y-6">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100/50 cursor-pointer">
            <div className={`w-2 h-10 rounded-full ${alert.accent} shrink-0`}></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${alert.text}`}>
                  {alert.type}
                </span>
                <span className="text-xs text-slate-400 font-medium">{alert.time}</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm leading-tight">{alert.title}</h4>
            </div>
          </div>
        ))}
        
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Infrastructure Status</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Open Departments</span>
              <span className="text-emerald-600 font-bold">{summary.totals.departments}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full">
              <div className="w-[72%] h-full bg-emerald-500 rounded-full shadow-sm"></div>
            </div>
            
            <div className="flex items-center justify-between text-sm pt-2">
              <span className="text-slate-600 font-medium">Today&apos;s Visits Queue</span>
              <span className="text-emerald-600 font-bold">{summary.totals.todayAppointments}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full">
              <div className="w-[48%] h-full bg-emerald-500 rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
