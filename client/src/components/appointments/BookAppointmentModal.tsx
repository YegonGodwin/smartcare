import { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  consultationFee: number;
  department: {
    _id: string;
    name: string;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ApiResponse<T> {
  data: T;
}

interface AppointmentResult {
  _id: string;
  appointmentNumber?: string;
  scheduledFor?: string;
  doctor?: {
    firstName?: string;
    lastName?: string;
  } | null;
}

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (appointment?: AppointmentResult) => void;
  mode?: 'book' | 'reschedule';
  initialDoctorId?: string;
  rescheduleMeta?: {
    doctorName?: string;
    scheduledFor?: string;
  };
}

export function BookAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'book',
  initialDoctorId,
  rescheduleMeta,
}: BookAppointmentModalProps) {
  const [step, setStep] = useState<'doctor' | 'datetime' | 'details'>('doctor');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [appointmentType, setAppointmentType] = useState<'consultation' | 'review' | 'emergency'>('consultation');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasInitialized(false);
      fetchDoctors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = doctors.filter(
        (doc) =>
          doc.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [searchTerm, doctors]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    if (!isOpen || hasInitialized) {
      return;
    }

    if (initialDoctorId && doctors.length > 0) {
      const matchedDoctor = doctors.find((doctor) => doctor._id === initialDoctorId);
      if (matchedDoctor) {
        setSelectedDoctor(matchedDoctor);
        setStep('datetime');
      }
    }

    setHasInitialized(true);
  }, [isOpen, hasInitialized, initialDoctorId, doctors]);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest<{ data: Doctor[] }>('/doctors?status=active&limit=100');
      setDoctors(response.data);
      setFilteredDoctors(response.data);
    } catch (err) {
      setError('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiRequest<{ data: TimeSlot[] }>(
        `/appointments/available-slots?doctorId=${selectedDoctor._id}&date=${selectedDate}`
      );
      setAvailableSlots(response.data);
      
      // Show helpful message if no slots available
      if (response.data.length === 0) {
        setError('No available time slots for this date. The doctor may not have configured their schedule yet or may be unavailable on this day.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load available slots');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot || !reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiRequest<ApiResponse<AppointmentResult>>('/appointments/book', {
        method: 'POST',
        body: JSON.stringify({
          doctor: selectedDoctor._id,
          department: selectedDoctor.department._id,
          scheduledFor: selectedSlot,
          reason: reason.trim(),
          type: appointmentType,
          durationMinutes: 30
        })
      });

      onSuccess?.(response.data);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('doctor');
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedSlot(null);
    setReason('');
    setAppointmentType('consultation');
    setSearchTerm('');
    setError(null);
    setHasInitialized(false);
    onClose();
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === 'reschedule' ? 'Reschedule Appointment' : 'Book Appointment'}
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
            >
              X
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <div className={`flex-1 h-1 rounded ${step === 'doctor' ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-1 rounded ${step === 'datetime' ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-1 rounded ${step === 'details' ? 'bg-blue-600' : 'bg-slate-200'}`} />
          </div>
        </div>

        <div className="p-6">
          {mode === 'reschedule' && rescheduleMeta && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Rescheduling
              {rescheduleMeta.doctorName ? ` with ${rescheduleMeta.doctorName}` : ''}.
              {rescheduleMeta.scheduledFor ? ` Current time: ${new Date(rescheduleMeta.scheduledFor).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}.` : ''}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 'doctor' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search Doctor
                </label>
                <Input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <p className="text-slate-500 text-center py-4">Loading doctors...</p>
                ) : filteredDoctors.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No doctors found</p>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <button
                      key={doctor._id}
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setStep('datetime');
                      }}
                      className="w-full p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                    >
                      <div className="font-semibold text-slate-900">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">{doctor.specialization}</div>
                      <div className="text-sm text-slate-500 mt-1">{doctor.department.name}</div>
                      <div className="text-sm font-medium text-blue-600 mt-2">
                        Fee: ${doctor.consultationFee}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 'datetime' && selectedDoctor && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="font-semibold text-slate-900">
                  Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                </div>
                <div className="text-sm text-slate-600">{selectedDoctor.specialization}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Date
                </label>
                <Input
                  type="date"
                  min={getMinDate()}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Available Time Slots
                  </label>
                  {isLoading ? (
                    <p className="text-slate-500 text-center py-4">Loading slots...</p>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-6 px-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-800 font-medium mb-2">No available slots for this date</p>
                      <p className="text-sm text-amber-700">
                        The doctor may not have configured their schedule yet or may be unavailable on this day. 
                        Please try a different date or contact the clinic for assistance.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedSlot(slot.time)}
                          disabled={!slot.available}
                          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                            slot.available
                              ? selectedSlot === slot.time
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-slate-200 hover:border-blue-500 text-slate-700'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {new Date(slot.time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep('doctor')} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep('details')}
                  disabled={!selectedSlot}
                  className="flex-1"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg space-y-1">
                <div className="font-semibold text-slate-900">
                  Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                </div>
                <div className="text-sm text-slate-600">{selectedDoctor?.specialization}</div>
                <div className="text-sm text-slate-600">
                  {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm font-medium text-blue-600">
                  {selectedSlot && new Date(selectedSlot).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Appointment Type
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="review">Follow-up Review</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Visit *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please describe your symptoms or reason for visit..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep('datetime')} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleBookAppointment}
                  disabled={isLoading || !reason.trim()}
                  className="flex-1"
                >
                  {isLoading ? 'Booking...' : mode === 'reschedule' ? 'Confirm New Time' : 'Book Appointment'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

