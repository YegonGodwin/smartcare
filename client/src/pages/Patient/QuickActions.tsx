export function QuickActions() {
  const actions = [
    {
      label: "Book Appointment",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "emerald",
      description: "Schedule a new visit",
    },
    {
      label: "Lab Results",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "blue",
      description: "View test reports",
    },
    {
      label: "Prescriptions",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "purple",
      description: "Refill medications",
    },
    {
      label: "Message Doctor",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      color: "amber",
      description: "Direct communication",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {actions.map((action, idx) => (
        <button
          key={idx}
          className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all text-left relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 w-24 h-24 bg-${action.color}-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform`} />
          <div className={`relative z-10 p-3 bg-${action.color}-50 text-${action.color}-600 rounded-2xl w-fit group-hover:bg-${action.color}-600 group-hover:text-white transition-colors`}>
            {action.icon}
          </div>
          <div className="relative z-10 mt-4">
            <h3 className="text-sm font-bold text-slate-900">{action.label}</h3>
            <p className="text-xs text-slate-500 mt-1">{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
