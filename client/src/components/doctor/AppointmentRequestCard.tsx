import { useState } from 'react';
import { Button } from '../ui/Button';

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

interface AppointmentRequestCardProps {
  appointment: Appointment;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onReschedule: (id: string) => void;
}

export function AppointmentRequestCard({
  appointment,
  onApprove,
  onReject,
  onReschedule
}: AppointmentRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const appointmentDate = new Date(appointment.scheduledFor);
  const isToday = appointmentDate.toDateString() === new Date().toDateString();
  const isTomorrow = appointmentDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  const getDateLabel = () => {
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return appointmentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = () => {
    switch (appointment.priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(appointment._id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    try {
      await onReject(appointment._id, rejectionReason);
      setShowRejectForm(false);
      setRejectionReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-slate-900">
              {appointment.patient.firstName} {appointment.patient.lastName}
            </h3>
            {appointment.isFirstVisit && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                First Visit
              </span>
            )}
            {appointment.priority && appointment.priority !== 'normal' && (
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getPriorityColor()}`}>
                {appointment.priority.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">
            Patient #{appointment.patient.patientNumber}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-blue-600">{getDateLabel()}</div>
          <div className="text-sm text-slate-600">
            {appointmentDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </div>
          <div className="text-xs text-slate-500 mt-1">{appointment.durationMinutes} min</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Type:</span>
          <span className="text-sm text-slate-700 capitalize">{appointment.type}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Reason:</p>
          <p className="text-sm text-slate-700">{appointment.reason}</p>
        </div>
      </div>

      {!showRejectForm ? (
        <div className="flex items-center gap-2">
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            size="sm"
          >
            {isProcessing ? 'Approving...' : '✓ Approve'}
          </Button>
          <Button
            onClick={() => onReschedule(appointment._id)}
            disabled={isProcessing}
            variant="outline"
            size="sm"
          >
            🔄 Suggest Time
          </Button>
          <Button
            onClick={() => setShowRejectForm(true)}
            disabled={isProcessing}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            ✕ Reject
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Provide a reason for rejection..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
              size="sm"
            >
              {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
            <Button
              onClick={() => {
                setShowRejectForm(false);
                setRejectionReason('');
              }}
              disabled={isProcessing}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
