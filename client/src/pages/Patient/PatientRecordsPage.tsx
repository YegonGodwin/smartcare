import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { useApiQuery } from '@hooks/useApiQuery';
import type { MedicalRecord } from '@hooks/useDashboardData';
import { PatientHeader } from './PatientHeader';
import { PatientSidebar } from './PatientSidebar';

interface ApiResponse<T> {
  data: T;
}

export function PatientRecordsPage() {
  const { user } = useAuth();
  const patientId = user?.patientProfile?._id || user?.patientProfile?.id;
  const { data, isLoading, error } = useApiQuery<MedicalRecord[]>(
    patientId
      ? () =>
          apiRequest<ApiResponse<MedicalRecord[]>>(`/medical-records?patient=${patientId}&limit=100&sort=-visitDate`).then(
            (response) => response.data
          )
      : null,
    [patientId]
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PatientSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <PatientHeader />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Medical Records</h1>
              <p className="text-slate-600 mt-1">Diagnosis history, lab results, and follow-up dates.</p>
            </div>
            <div className="space-y-4">
              {isLoading && <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">Loading records...</div>}
              {error && <div className="bg-white rounded-2xl border border-red-200 p-6 text-sm text-red-600">{error}</div>}
              {data?.map((record) => (
                <div key={record._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{record.diagnosis}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Visit date:{' '}
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
                          new Date(record.visitDate)
                        )}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                      {record.labResults?.length || 0} lab results
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Symptoms</p>
                      <p className="text-sm text-slate-700 mt-1">{record.symptoms?.join(', ') || 'No symptoms recorded'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Follow Up</p>
                      <p className="text-sm text-slate-700 mt-1">
                        {record.followUpDate
                          ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
                              new Date(record.followUpDate)
                            )
                          : 'No follow-up scheduled'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
