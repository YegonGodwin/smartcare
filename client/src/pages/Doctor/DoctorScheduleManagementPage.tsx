import { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { DoctorHeader } from './DoctorHeader';
import { DoctorSidebar } from './DoctorSidebar';
import { AppointmentRequestCard } from '../../components/doctor/AppointmentRequestCard';
import { WorkloadDashboard } from '../../components/doctor/WorkloadDashboard';
import { Button } from '@components/ui';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

interface Appointment {
  _id: string;
  appointmentNumber: string;
  patient: Patient;
  doctor: Doctor;
  scheduledFor: string;
  durationMinutes: number;
  type: string;
  status: string;
  reason: string;
  priority?: string;
  isFirstVisit?: boolean;
}

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
  dateRange: {
    start: string;
    end: string;
  };
}

type TabType = 'pending' | 'workload';

export function DoctorScheduleManagementPage() {
  const { user } = useAuth();
  const doctorId = user?.doctorProfile?._id || user?.doctorProfile;
  
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [workloadData, setWorkloadData] = useState<WorkloadData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set());
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  useEffect(() => {
    if (doctorId) {
      if (activeTab === 'pending') {
        fetchPendingAppointments();
      } else if (activeTab === 'workload') {
        fetchWorkloadData();
      }
    }
  }, [doctorId, activeTab]);

  const fetchPendingAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ data: Appointment[] }>(
        `/doctor-schedule/${doctorId}/pending`
      );
      setPendingAppointments(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load pending appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkloadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ data: WorkloadData }>(
        `/doctor-schedule/${doctorId}/workload`
      );
      setWorkloadData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workload data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (appointmentId: string) => {
    try {
      await apiRequest(`/doctor-schedule/appointments/${appointmentId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ note: 'Approved by doctor' })
      });
      
      setSuccessMessage('Appointment approved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Remove from pending list
      setPendingAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
      setSelectedAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to approve appointment');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleReject = async (appointmentId: string, reason: string) => {
    try {
      await apiRequest(`/doctor-schedule/appointments/${appointmentId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      
      setSuccessMessage('Appointment rejected. Patient has been notified.');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Remove from pending list
      setPendingAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
      setSelectedAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to reject appointment');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleReschedule = (appointmentId: string) => {
    setRescheduleAppointmentId(appointmentId);
    setShowRescheduleModal(true);
    setNewDate('');
    setNewTime('');
    setRescheduleReason('');
  };

  const submitReschedule = async () => {
    if (!rescheduleAppointmentId || !newDate || !newTime) {
      setError('Please select a new date and time');
      return;
    }

    try {
      const newDateTime = new Date(`${newDate}T${newTime}`);
      
      await apiRequest(`/doctor-schedule/appointments/${rescheduleAppointmentId}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({
          newDate: newDateTime.toISOString(),
          reason: rescheduleReason || 'Rescheduled by doctor'
        })
      });
      
      setSuccessMessage('Appointment rescheduled successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      setShowRescheduleModal(false);
      setRescheduleAppointmentId(null);
      
      // Refresh pending appointments
      fetchPendingAppointments();
    } catch (err: any) {
      setError(err.message || 'Failed to reschedule appointment');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedAppointments.size === 0) {
      setError('Please select appointments to approve');
      return;
    }

    try {
      const response = await apiRequest<{ data: { approved: string[]; failed: any[] } }>(
        '/doctor-schedule/appointments/bulk-approve',
        {
          method: 'POST',
          body: JSON.stringify({
            appointmentIds: Array.from(selectedAppointments)
          })
        }
      );
      
      const { approved, failed } = response.data;
      
      if (approved.length > 0) {
        setSuccessMessage(`Successfully approved ${approved.length} appointment(s)!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
      
      if (failed.length > 0) {
        setError(`${failed.length} appointment(s) could not be approved due to conflicts`);
        setTimeout(() => setError(null), 5000);
      }
      
      // Remove approved from list
      setPendingAppointments(prev => prev.filter(apt => !approved.includes(apt._id)));
      setSelectedAppointments(new Set());
    } catch (err: any) {
      setError(err.message || 'Failed to bulk approve appointments');
      setTimeout(() => setError(null), 5000);
    }
  };

  const toggleSelection = (appointmentId: string) => {
    setSelectedAppointments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appointmentId)) {
        newSet.delete(appointmentId);
      } else {
        newSet.add(appointmentId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedAppointments.size === pendingAppointments.length) {
      setSelectedAppointments(new Set());
    } else {
      setSelectedAppointments(new Set(pendingAppointments.map(apt => apt._id)));
    }
  };

  const getMinDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar user={user} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <DoctorHeader user={user} />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Schedule Management</h1>
              <p className="text-slate-600 mt-1">
                Manage appointment requests and monitor your workload
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-3 font-semibold transition-colors relative ${
                  activeTab === 'pending'
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending Approvals
                {pendingAppointments.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    {pendingAppointments.length}
                  </span>
                )}
                {activeTab === 'pending' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('workload')}
                className={`px-6 py-3 font-semibold transition-colors relative ${
                  activeTab === 'workload'
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Workload Analytics
                {activeTab === 'workload' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            </div>

            {/* Messages */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            {/* Content */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-slate-600 mt-4">Loading...</p>
              </div>
            )}

            {!isLoading && activeTab === 'pending' && (
              <div className="space-y-6">
                {/* Bulk Actions */}
                {pendingAppointments.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAppointments.size === pendingAppointments.length && pendingAppointments.length > 0}
                          onChange={selectAll}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          Select All ({pendingAppointments.length})
                        </span>
                      </label>
                      
                      {selectedAppointments.size > 0 && (
                        <span className="text-sm text-slate-600">
                          {selectedAppointments.size} selected
                        </span>
                      )}
                    </div>
                    
                    {selectedAppointments.size > 0 && (
                      <Button
                        onClick={handleBulkApprove}
                        className="bg-emerald-600 hover:bg-emerald-700"
                        size="sm"
                      >
                        ✓ Approve Selected ({selectedAppointments.size})
                      </Button>
                    )}
                  </div>
                )}

                {/* Pending Appointments List */}
                {pendingAppointments.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                    <p className="text-slate-600">
                      You have no pending appointment requests at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pendingAppointments.map((appointment) => (
                      <div key={appointment._id} className="relative">
                        <label className="absolute top-4 left-4 z-10 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAppointments.has(appointment._id)}
                            onChange={() => toggleSelection(appointment._id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                        <div className="pl-10">
                          <AppointmentRequestCard
                            appointment={appointment}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onReschedule={handleReschedule}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isLoading && activeTab === 'workload' && workloadData && (
              <WorkloadDashboard
                data={workloadData}
                dateRange={workloadData.dateRange}
              />
            )}
          </div>
        </main>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Reschedule Appointment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={getMinDateTime()}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Why are you rescheduling this appointment?"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <Button
                onClick={submitReschedule}
                disabled={!newDate || !newTime}
                className="flex-1"
              >
                Confirm Reschedule
              </Button>
              <Button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleAppointmentId(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
