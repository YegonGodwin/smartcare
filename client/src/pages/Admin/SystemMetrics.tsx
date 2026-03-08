import type { DashboardSummary } from '@hooks/useDashboardData';

interface SystemMetricsProps {
  summary: DashboardSummary['totals'];
}

const metricThemes = [
  { badge: 'bg-indigo-50 text-indigo-600', trend: 'text-indigo-600' },
  { badge: 'bg-blue-50 text-blue-600', trend: 'text-blue-600' },
  { badge: 'bg-purple-50 text-purple-600', trend: 'text-purple-600' },
  { badge: 'bg-emerald-50 text-emerald-600', trend: 'text-emerald-600' },
];

export function SystemMetrics({ summary }: SystemMetricsProps) {
  const metrics = [
    {
      label: 'Active Patients',
      value: summary.patients.toLocaleString(),
      change: 'Live patient profiles',
    },
    {
      label: 'Active Doctors',
      value: summary.doctors.toLocaleString(),
      change: 'Current clinical staff',
    },
    {
      label: "Today's Appointments",
      value: summary.todayAppointments.toLocaleString(),
      change: 'Scheduled for today',
    },
    {
      label: 'Medical Records',
      value: summary.medicalRecords.toLocaleString(),
      change: `${summary.departments} active departments`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${metricThemes[index].badge} group-hover:scale-110 transition-transform`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
                {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                {index === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />}
              </svg>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${metricThemes[index].trend}`}>
              {metric.change}
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{metric.value}</h3>
          <p className="text-slate-500 text-sm font-medium mt-1">{metric.label}</p>
        </div>
      ))}
    </div>
  );
}
