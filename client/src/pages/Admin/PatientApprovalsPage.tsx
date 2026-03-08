import { useEffect, useState } from 'react';
import { useAuth } from '@hooks/index';
import { Button } from '@components/ui';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface PendingPatient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  patientProfile: {
    patientNumber: string;
    dateOfBirth: string;
    isVerified: boolean;
  };
  isApproved: boolean;
  createdAt: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scaleIn">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function PatientApprovalsPage() {
  const { user, getPendingPatients, approvePatient, rejectPatient } = useAuth();
  const [patients, setPatients] = useState<PendingPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PendingPatient | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadPatients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getPendingPatients();
      setPatients(response.users);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load pending patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPatients();
  }, []);

  const handleApprove = async () => {
    if (!selectedPatient) return;

    setIsProcessing(true);
    setError(null);

    try {
      await approvePatient(selectedPatient._id, approvalNote);
      setSuccess(`Patient ${selectedPatient.firstName} ${selectedPatient.lastName} approved successfully`);
      setApproveModalOpen(false);
      setApprovalNote('');
      setSelectedPatient(null);
      await loadPatients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve patient');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPatient) return;

    setIsProcessing(true);
    setError(null);

    try {
      await rejectPatient(selectedPatient._id, rejectionReason || 'Registration rejected');
      setSuccess(`Patient registration rejected for ${selectedPatient.firstName} ${selectedPatient.lastName}`);
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedPatient(null);
      await loadPatients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject patient');
    } finally {
      setIsProcessing(false);
    }
  };

  const openApproveModal = (patient: PendingPatient) => {
    setSelectedPatient(patient);
    setApproveModalOpen(true);
  };

  const openRejectModal = (patient: PendingPatient) => {
    setSelectedPatient(patient);
    setRejectModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Patient Approvals</h1>
                <p className="text-slate-600 mt-1">
                  Review and approve pending patient registrations
                  {patients.length > 0 && (
                    <span className="ml-2 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                      {patients.length} pending
                    </span>
                  )}
                </p>
              </div>
              <Button
                onClick={loadPatients}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>

            {/* Alerts */}
            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Pending Registrations</h2>
              </div>

              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
                  <p className="mt-4 text-sm text-slate-500">Loading pending patients...</p>
                </div>
              ) : patients.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">All Caught Up!</h3>
                  <p className="text-sm text-slate-500">No pending patient registrations to review.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient No.</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Registered</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((patient) => (
                      <tr key={patient._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-xs text-slate-500 capitalize">
                            DOB: {new Date(patient.patientProfile.dateOfBirth).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded">
                            {patient.patientProfile.patientNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">{patient.email}</div>
                          <div className="text-xs text-slate-500">{patient.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(patient.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => openApproveModal(patient)}
                              variant="primary"
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </Button>
                            <Button
                              onClick={() => openRejectModal(patient)}
                              variant="secondary"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 border-red-200"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setApprovalNote('');
          setSelectedPatient(null);
        }}
        title="Approve Patient"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600 mb-2">Approving:</p>
              <p className="font-semibold text-slate-900">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
              <p className="text-sm text-slate-500">{selectedPatient.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Approval Note (Optional)
              </label>
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Add any notes about this approval..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => {
                  setApproveModalOpen(false);
                  setApprovalNote('');
                  setSelectedPatient(null);
                }}
                variant="secondary"
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                variant="primary"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                isLoading={isProcessing}
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Approve Patient
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectionReason('');
          setSelectedPatient(null);
        }}
        title="Reject Registration"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm text-red-700 mb-2">Rejecting registration for:</p>
              <p className="font-semibold text-red-900">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
              <p className="text-sm text-red-600">{selectedPatient.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectionReason('');
                  setSelectedPatient(null);
                }}
                variant="secondary"
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                variant="secondary"
                className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                isLoading={isProcessing}
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Registration
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
