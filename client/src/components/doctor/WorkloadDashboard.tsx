interface WorkloadData {
  summary: {
    totalAppointments: number;
    totalHours: string;
    utilizationRate: number;
    pendingCount: number;
    confirmedCount: number;
    completedCount: number;
  };
  distribution: {
    firstVisits: number;
    followUps: number;
  };
  dailyWorkload: Array<{
    date: string;
    count: number;
    totalMinutes: number;
    pending: number;
    confirmed: number;
  }>;
}

interface WorkloadDashboardProps {
  data: WorkloadData;
  dateRange: {
    start: string;
    end: string;
  };
}

export function WorkloadDashboard({ data, dateRange }: WorkloadDashboardProps) {
  const { summary, distribution, dailyWorkload } = data;

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 75) return 'text-amber-600';
    if (rate >= 50) return 'text-emerald-600';
    return 'text-blue-600';
  };

  const getUtilizationBgColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-600';
    if (rate >= 75) return 'bg-amber-600';
    if (rate >= 50) return 'bg-emerald-600';
    return 'bg-blue-600';
  };

  const getUtilizationMessage = (rate: number) => {
    if (rate >= 90) return 'High workload - Consider adjusting schedule';
    if (rate >= 75) return 'Busy schedule - Well utilized';
    if (rate >= 50) return 'Moderate workload - Good balance';
    return 'Light schedule - Capacity available';
  };

  const maxDailyCount = Math.max(...dailyWorkload.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Utilization Overview */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Workload Utilization</h3>
          <div className={`text-3xl font-bold ${getUtilizationColor(summary.utilizationRate)}`}>
            <span className="text-white">{summary.utilizationRate}%</span>
          </div>
        </div>
        
        <div className="bg-white/20 rounded-full h-3 mb-3 overflow-hidden">
          <div
            className={`h-full ${getUtilizationBgColor(summary.utilizationRate)} transition-all duration-500`}
            style={{ width: `${Math.min(summary.utilizationRate, 100)}%` }}
          />
        </div>
        
        <p className="text-blue-100 text-sm">{getUtilizationMessage(summary.utilizationRate)}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900">{summary.totalAppointments}</div>
          <div className="text-sm text-slate-600 mt-1">Total Appointments</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900">{summary.totalHours}h</div>
          <div className="text-sm text-slate-600 mt-1">Booked Hours</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-amber-600">{summary.pendingCount}</div>
          <div className="text-sm text-slate-600 mt-1">Pending Approval</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">{summary.confirmedCount}</div>
          <div className="text-sm text-slate-600 mt-1">Confirmed</div>
        </div>
      </div>

      {/* Patient Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h4 className="font-bold text-slate-900 mb-4">Patient Distribution</h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">First Visits</span>
              <span className="text-sm font-bold text-slate-900">{distribution.firstVisits}</span>
            </div>
            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500"
                style={{
                  width: `${(distribution.firstVisits / summary.totalAppointments) * 100}%`
                }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Follow-ups</span>
              <span className="text-sm font-bold text-slate-900">{distribution.followUps}</span>
            </div>
            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-500"
                style={{
                  width: `${(distribution.followUps / summary.totalAppointments) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Workload Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h4 className="font-bold text-slate-900 mb-4">Daily Workload</h4>
        <div className="space-y-3">
          {dailyWorkload.map((day) => {
            const date = new Date(day.date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={day.date} className={`${isToday ? 'bg-blue-50 rounded-lg p-3 -mx-3' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isToday ? 'text-blue-700' : 'text-slate-700'}`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600">
                      {day.count} apt • {(day.totalMinutes / 60).toFixed(1)}h
                    </span>
                    {day.pending > 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-full">
                        {day.pending} pending
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isToday ? 'bg-blue-600' : 'bg-slate-400'
                    }`}
                    style={{
                      width: `${(day.count / maxDailyCount) * 100}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
