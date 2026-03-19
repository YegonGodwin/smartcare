import { type MedicalRecord } from '@hooks/useDashboardData';

interface LabResultsRepositoryProps {
  records: MedicalRecord[];
}

export function LabResultsRepository({ records }: LabResultsRepositoryProps) {
  const allLabResults = records
    .flatMap((record) => 
      (record.labResults || []).map(result => ({
        ...result,
        visitDate: record.visitDate,
        doctor: record.doctor,
        recordNumber: record.recordNumber
      }))
    )
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

  if (allLabResults.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          Lab Results & Reports
        </h3>
        <div className="text-center py-10 px-4 border-2 border-dashed border-slate-100 rounded-3xl">
          <p className="text-slate-400 text-sm font-medium">No laboratory results found in your medical history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          Lab Results & Reports
        </h3>
        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">
          Download All
        </button>
      </div>

      <div className="overflow-x-auto -mx-8 px-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Test Details</th>
              <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Result</th>
              <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Reference Range</th>
              <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {allLabResults.slice(0, 5).map((lab, index) => {
              // Simple logic to determine if result is "Normal" based on reference range if available
              // In a real app, this would be more complex or provided by the doctor
              const isAbnormal = lab.result.toLowerCase().includes('high') || lab.result.toLowerCase().includes('low');
              
              return (
                <tr key={`${lab.recordNumber}-${index}`} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5">
                    <p className="font-bold text-slate-900">{lab.testName}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                      {new Date(lab.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {lab.recordNumber}
                    </p>
                  </td>
                  <td className="py-5 text-center">
                    <span className={`text-sm font-black ${isAbnormal ? 'text-amber-600' : 'text-slate-900'}`}>
                      {lab.result} <span className="text-[10px] font-bold text-slate-400">{lab.unit}</span>
                    </span>
                  </td>
                  <td className="py-5 text-right font-mono text-xs text-slate-500">
                    {lab.referenceRange || 'N/A'}
                  </td>
                  <td className="py-5 text-right">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isAbnormal 
                        ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isAbnormal ? 'bg-amber-600' : 'bg-emerald-600'}`}></div>
                      {isAbnormal ? 'Requires Review' : 'Normal'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button className="w-full mt-8 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
        View Full Medical History
      </button>
    </div>
  );
}
