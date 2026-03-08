import type { Appointment, MedicalRecord, PatientProfile } from '@hooks/useDashboardData';

interface PatientStatsProps {
  patient: PatientProfile | null;
  appointments: Appointment[];
  records: MedicalRecord[];
}

const statColorClasses = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  rose: 'bg-rose-50 text-rose-600',
} as const;

export function PatientStats({ patient, appointments, records }: PatientStatsProps) {
  const upcomingAppointments = appointments.filter((appointment) => new Date(appointment.scheduledFor).getTime() >= Date.now());
  const nextAppointment = upcomingAppointments[0];
  const prescriptionCount = records.reduce((total, record) => total + (record.prescriptions?.length || 0), 0);
  const labCount = records.reduce((total, record) => total + (record.labResults?.length || 0), 0);
  const chronicCount = patient?.chronicConditions?.length || 0;

  const stats = [
    {
      label: "Upcoming Appointments",
      value: String(upcomingAppointments.length),
      change: nextAppointment
        ? `Next: ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(nextAppointment.scheduledFor))}`
        : 'No future bookings',
      trend: "up",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "emerald",
    },
    {
      label: "Active Prescriptions",
      value: String(prescriptionCount),
      change: `${records.length} visits on file`,
      trend: "stable",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "blue",
    },
    {
      label: "Recent Lab Reports",
      value: String(labCount),
      change: labCount > 0 ? 'Lab results available' : 'No recorded labs yet',
      trend: "up",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "purple",
    },
    {
      label: "Chronic Conditions",
      value: String(chronicCount),
      change: patient?.bloodGroup ? `Blood group: ${patient.bloodGroup}` : 'Profile health data synced',
      trend: "up",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: "rose",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-2xl ${statColorClasses[stat.color as keyof typeof statColorClasses]}`}>
              {stat.icon}
            </div>
            {stat.trend !== 'stable' && (
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stat.trend === 'up' ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
            <p className="text-slate-400 text-[10px] mt-2 font-bold">{stat.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
