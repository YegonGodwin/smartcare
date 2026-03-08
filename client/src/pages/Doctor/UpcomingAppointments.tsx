import type { Appointment } from '@hooks/useDashboardData';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  const upcomingAppointments = appointments
    .filter((appointment) => new Date(appointment.scheduledFor).getTime() >= Date.now())
    .slice(0, 6)
    .map((appointment) => {
      const patientName = `${appointment.patient?.firstName || 'Patient'} ${appointment.patient?.lastName || ''}`.trim();
      return {
        id: appointment._id,
        patient: patientName,
        time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(appointment.scheduledFor)),
        type: appointment.type,
        status: appointment.status,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=eff6ff&color=2563eb`,
      };
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Today's Appointments</h2>
        <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {upcomingAppointments.length === 0 && (
            <div className="text-sm text-slate-500">No upcoming appointments assigned.</div>
          )}
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-xl transition-colors">
              <div className="flex items-center gap-4">
                <img src={appointment.avatar} alt={appointment.patient} className="w-12 h-12 rounded-xl" />
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{appointment.patient}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{appointment.type}</span>
                    <span className="text-xs text-slate-400">{appointment.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  appointment.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' :
                  appointment.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {appointment.status}
                </span>
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
