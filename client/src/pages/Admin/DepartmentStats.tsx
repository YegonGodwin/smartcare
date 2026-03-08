import type { Department, Doctor } from '@hooks/useDashboardData';

interface DepartmentStatsProps {
  departments: Department[];
  doctors: Doctor[];
}

const accentClasses = ['bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500'];
const performanceBarClasses = {
  high: 'bg-emerald-500',
  medium: 'bg-blue-500',
  low: 'bg-amber-500',
} as const;

export function DepartmentStats({ departments, doctors }: DepartmentStatsProps) {
  const departmentRows = departments.map((department, index) => {
    const staffCount = doctors.filter((doctor) => {
      const departmentId = doctor.department?._id || doctor.department?.id;
      return departmentId === department._id || departmentId === department.id;
    }).length;
    const performance = staffCount > 8 ? 96 : staffCount > 3 ? 88 : 72;
    const status = staffCount > 8 ? 'Optimal' : staffCount > 3 ? 'Moderate Capacity' : 'Needs Staffing';

    return {
      name: department.name,
      staff: staffCount,
      performance,
      status,
      accent: accentClasses[index % accentClasses.length],
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Department Overview</h3>
        <button className="text-indigo-600 text-sm font-bold hover:underline">Manage Units</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Count</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Performance</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Operational Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departmentRows.map((dept, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${dept.accent}`}></div>
                    <span className="font-bold text-slate-800">{dept.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-600 font-medium">{dept.staff} Specialists</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[100px]">
                      <div 
                        className={`h-full rounded-full ${dept.performance > 90 ? performanceBarClasses.high : dept.performance > 85 ? performanceBarClasses.medium : performanceBarClasses.low}`}
                        style={{ width: `${dept.performance}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{dept.performance}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    dept.status === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    dept.status === 'Moderate Capacity' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {dept.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
