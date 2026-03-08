import type { Appointment, PatientProfile } from '@hooks/useDashboardData';

interface HealthMetricsProps {
  patient: PatientProfile | null;
  appointments: Appointment[];
}

const statusClasses = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
} as const;

const sparklineClasses = {
  emerald: 'bg-emerald-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
} as const;

export function HealthMetrics({ patient, appointments }: HealthMetricsProps) {
  const latestWithVitals = [...appointments].reverse().find((appointment) =>
    Object.values(appointment.vitals || {}).some(Boolean)
  );

  const metrics = [
    {
      label: 'Blood Pressure',
      value: latestWithVitals?.vitals?.bloodPressure || 'Not recorded',
      unit: latestWithVitals?.vitals?.bloodPressure ? 'mmHg' : '',
      status: latestWithVitals?.vitals?.bloodPressure ? 'Latest visit' : 'Pending',
      color: 'emerald' as const,
      history: [20, 35, 55, 70, 90],
    },
    {
      label: 'Blood Group',
      value: patient?.bloodGroup || 'Unknown',
      unit: '',
      status: patient?.bloodGroup ? 'On profile' : 'Pending',
      color: 'blue' as const,
      history: [15, 25, 40, 60, 80],
    },
    {
      label: 'Allergies',
      value: String(patient?.allergies?.length || 0),
      unit: 'tracked',
      status: patient?.allergies?.length ? 'Review before visit' : 'None listed',
      color: 'purple' as const,
      history: [10, 20, 30, 40, 50],
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Health Metrics</h2>
          <p className="text-sm text-slate-500 mt-1">Your latest vital signs</p>
        </div>
        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{metric.unit}</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClasses[metric.color]}`}>
                {metric.status}
              </span>
            </div>
            
            {/* Simple sparkline visualization */}
            <div className="h-10 flex items-end gap-1.5 px-1">
              {metric.history.map((val, i) => {
                const max = Math.max(...metric.history);
                const min = Math.min(...metric.history);
                const height = max === min ? 50 : ((val - min) / (max - min)) * 100;
                return (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-t-sm transition-all hover:opacity-100 ${sparklineClasses[metric.color]}`}
                    style={{ height: `${Math.max(20, height)}%`, opacity: Math.min(1, 0.4 + (i * 0.15)) }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors border border-slate-100">
        View Detailed History
      </button>
    </div>
  );
}
