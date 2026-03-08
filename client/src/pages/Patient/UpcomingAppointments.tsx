import type { Appointment } from '@hooks/useDashboardData';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  const upcomingAppointments = appointments
    .filter((appointment) => new Date(appointment.scheduledFor).getTime() >= Date.now())
    .slice(0, 6)
    .map((appointment) => {
      const doctorName = `Dr. ${appointment.doctor?.firstName || ''} ${appointment.doctor?.lastName || 'Assigned'}`.trim();
      const scheduledDate = new Date(appointment.scheduledFor);

      return {
        id: appointment._id,
        doctor: doctorName,
        specialty: appointment.doctor?.specialization || appointment.department?.name || 'General Practice',
        date: new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(scheduledDate),
        time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(scheduledDate),
        type: appointment.type,
        status: appointment.status,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=10b981&color=fff`,
      };
    });

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Don't miss your next visit</p>
        </div>
        <button className="text-emerald-600 text-sm font-bold hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-xl">
          View All
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {upcomingAppointments.length === 0 && (
          <div className="p-6 text-sm text-slate-500">No upcoming appointments booked.</div>
        )}
        {upcomingAppointments.map((apt) => (
          <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-6">
              <img src={apt.image} alt={apt.doctor} className="w-14 h-14 rounded-2xl shadow-sm border-2 border-white" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 truncate">{apt.doctor}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {apt.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{apt.specialty}</p>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {apt.date}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {apt.time}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                  Join Call
                </button>
                <button className="px-4 py-2 bg-white text-slate-600 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50">
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
