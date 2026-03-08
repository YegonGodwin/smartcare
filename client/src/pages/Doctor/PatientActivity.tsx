import type { MedicalRecord } from '@hooks/useDashboardData';

interface PatientActivityProps {
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

export function PatientActivity({ records }: PatientActivityProps) {
  const activities = records.slice(0, 5).map((record, index) => ({
      id: record._id,
      patient: `${record.patient?.firstName || 'Patient'} ${record.patient?.lastName || ''}`.trim(),
      action: index === 0 ? 'Latest Consultation' : 'Medical Record Updated',
      time: getRelativeTime(record.visitDate),
      description: record.diagnosis,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 001.414 3.414h15.828a2 2 0 001.414-3.414l-2.387-2.387z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13V5a2 2 0 00-2-2H9a2 2 0 00-2 2v8" />
        </svg>
      ),
      color: index % 2 === 0 ? 'purple' : 'blue',
    }));
  const activityColorClasses = {
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
  } as const;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
      </div>
      <div className="p-6">
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-5 before:border-l before:border-slate-100 before:pointer-events-none">
          {activities.length === 0 && <div className="text-sm text-slate-500">No recent patient activity.</div>}
          {activities.map((activity) => (
            <div key={activity.id} className="relative flex gap-6">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 shrink-0 ${activityColorClasses[activity.color as keyof typeof activityColorClasses]}`}>
                {activity.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900">{activity.patient}</h4>
                  <span className="text-xs text-slate-400 font-medium">{activity.time}</span>
                </div>
                <p className="text-sm font-semibold text-slate-700">{activity.action}</p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-8 py-3 px-4 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
          View All Activity
        </button>
      </div>
    </div>
  );
}
