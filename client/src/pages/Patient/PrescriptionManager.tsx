import { type MedicalRecord } from '@hooks/useDashboardData';

interface PrescriptionManagerProps {
  records: MedicalRecord[];
}

export function PrescriptionManager({ records }: PrescriptionManagerProps) {
  // Extract all unique medications from records
  const medications = records
    .flatMap((record) => 
      (record.prescriptions || []).map(p => ({
        ...p,
        prescribedBy: record.doctor,
        date: record.visitDate
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (medications.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          Active Prescriptions
        </h3>
        <div className="text-center py-10 px-4 border-2 border-dashed border-slate-100 rounded-3xl">
          <p className="text-slate-400 text-sm font-medium">No active prescriptions on file.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          Active Prescriptions
        </h3>
        <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-2 py-1 rounded-md uppercase tracking-wider">
          {medications.length} Total
        </span>
      </div>

      <div className="space-y-4">
        {medications.slice(0, 3).map((med, index) => (
          <div key={`${med.name}-${index}`} className="flex items-start gap-4 p-5 rounded-3xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group">
            <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-slate-900 truncate">{med.name}</h4>
                <button className="shrink-0 text-[10px] font-black uppercase tracking-widest text-purple-600 hover:text-purple-700 transition-colors border border-purple-200 px-2 py-1 rounded-lg">
                  Request Refill
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">{med.dosage} • {med.frequency}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[65%] rounded-full"></div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-now0-wrap">65% Course</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-4 border-2 border-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:border-slate-100 hover:text-slate-900 transition-all">
        View Medication History
      </button>
    </div>
  );
}
