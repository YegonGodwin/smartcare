export function MedicationReminders() {
  const schedule = [
    {
      id: 1,
      med: "Amoxicillin",
      dose: "500mg",
      time: "08:00 AM",
      taken: true,
      color: "emerald",
    },
    {
      id: 2,
      med: "Lisinopril",
      dose: "10mg",
      time: "09:30 AM",
      taken: true,
      color: "blue",
    },
    {
      id: 3,
      med: "Vitamin D3",
      dose: "2000 IU",
      time: "01:00 PM",
      taken: false,
      color: "purple",
    },
    {
      id: 4,
      med: "Metformin",
      dose: "500mg",
      time: "07:00 PM",
      taken: false,
      color: "amber",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Medication Schedule</h2>
          <p className="text-sm text-slate-500 mt-1">Today's doses</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          2 of 4 Taken
        </div>
      </div>

      <div className="space-y-3">
        {schedule.map((item) => (
          <div 
            key={item.id} 
            className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
              item.taken 
                ? 'bg-slate-50 border-slate-100 opacity-60' 
                : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shrink-0`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-bold truncate ${item.taken ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                {item.med}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{item.dose} • {item.time}</p>
            </div>

            <button 
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                item.taken 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white border-2 border-slate-100 text-slate-300 hover:border-emerald-500 hover:text-emerald-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors">
        Manage Prescriptions
      </button>
    </div>
  );
}
