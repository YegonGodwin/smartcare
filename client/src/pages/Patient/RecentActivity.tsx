import type { Appointment, MedicalRecord } from '@hooks/useDashboardData';

interface RecentActivityProps {
  appointments: Appointment[];
  records: MedicalRecord[];
}

function getRelativeTime(value: string) {
  const delta = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(delta / 60000);

  if (minutes < 60) {
    return `${Math.max(1, minutes)} mins ago`;
  }

  if (minutes < 1440) {
    return `${Math.floor(minutes / 60)} hours ago`;
  }

  return `${Math.floor(minutes / 1440)} days ago`;
}

export function RecentActivity({ appointments, records }: RecentActivityProps) {
  const activities = [
    ...records.map((record) => ({
      id: record._id,
      title: 'Medical Record Updated',
      desc: record.diagnosis,
      sortAt: new Date(record.visitDate).getTime(),
      time: getRelativeTime(record.visitDate),
      type: record.labResults && record.labResults.length > 0 ? 'lab' : 'prescription',
      color: record.labResults && record.labResults.length > 0 ? 'blue' : 'purple',
    })),
    ...appointments.map((appointment) => ({
      id: appointment._id,
      title: 'Appointment Scheduled',
      desc: `${appointment.type} with Dr. ${appointment.doctor?.lastName || 'Assigned'}`,
      sortAt: new Date(appointment.scheduledFor).getTime(),
      time: getRelativeTime(appointment.scheduledFor),
      type: 'appointment',
      color: 'emerald',
    })),
  ]
    .sort((left, right) => right.sortAt - left.sortAt)
    .slice(0, 5);
  const activityColorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  } as const;

  const getIcon = (type: string) => {
    switch (type) {
      case 'lab':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'appointment':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'prescription':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'message':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
          <p className="text-sm text-slate-500 mt-1">Your healthcare timeline</p>
        </div>
        <button className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition-colors">
          View Timeline
        </button>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-100 before:via-slate-100 before:to-transparent">
        {activities.length === 0 && <div className="text-sm text-slate-500">No recent activity available.</div>}
        {activities.map((activity) => (
          <div key={activity.id} className="relative flex items-start gap-6 group">
            <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white group-hover:scale-110 transition-transform ${activityColorClasses[activity.color as keyof typeof activityColorClasses]}`}>
              {getIcon(activity.type)}
            </div>
            
            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">{activity.title}</h3>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{activity.time}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{activity.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-50">
        <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors border border-slate-100">
          Full Medical History
        </button>
      </div>
    </div>
  );
}
