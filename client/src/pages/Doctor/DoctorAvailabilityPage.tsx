import { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { DoctorHeader } from './DoctorHeader';
import { DoctorSidebar } from './DoctorSidebar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface TimeOff {
  _id: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: string;
  isRecurring: boolean;
  recurringPattern?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
}

interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

export function DoctorAvailabilityPage() {
  const { user } = useAuth();
  const doctorId = user?.doctorProfile?._id || user?.doctorProfile?.id;
  
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
  const [isEmergencyUnavailable, setIsEmergencyUnavailable] = useState(false);
  const [emergencyUntil, setEmergencyUntil] = useState('');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTimeOff, setShowAddTimeOff] = useState(false);
  
  // Time-off form state
  const [newTimeOff, setNewTimeOff] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'vacation' as const
  });

  useEffect(() => {
    if (doctorId) {
      fetchAvailability();
    }
  }, [doctorId]);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest<{ data: any }>(`/availability/${doctorId}`);
      setAvailability(response.data.availability || []);
      setTimeOff(response.data.timeOff || []);
      setIsEmergencyUnavailable(response.data.isEmergencyUnavailable || false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTimeOff = async () => {
    if (!newTimeOff.startDate || !newTimeOff.endDate) {
      setError('Please select start and end dates');
      return;
    }

    try {
      await apiRequest(`/availability/${doctorId}/time-off`, {
        method: 'POST',
        body: JSON.stringify(newTimeOff)
      });
      
      setShowAddTimeOff(false);
      setNewTimeOff({ startDate: '', endDate: '', reason: '', type: 'vacation' });
      fetchAvailability();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteTimeOff = async (timeOffId: string) => {
    if (!confirm('Are you sure you want to delete this time-off?')) return;

    try {
      await apiRequest(`/availability/${doctorId}/time-off/${timeOffId}`, {
        method: 'DELETE'
      });
      fetchAvailability();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleEmergency = async () => {
    try {
      await apiRequest(`/availability/${doctorId}/emergency`, {
        method: 'PATCH',
        body: JSON.stringify({
          isUnavailable: !isEmergencyUnavailable,
          until: emergencyUntil || undefined,
          reason: emergencyReason || undefined
        })
      });
      
      setIsEmergencyUnavailable(!isEmergencyUnavailable);
      if (!isEmergencyUnavailable) {
        setEmergencyUntil('');
        setEmergencyReason('');
      }
      fetchAvailability();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      vacation: 'bg-blue-100 text-blue-700',
      'sick-leave': 'bg-red-100 text-red-700',
      conference: 'bg-purple-100 text-purple-700',
      personal: 'bg-green-100 text-green-700',
      other: 'bg-slate-100 text-slate-700'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <DoctorHeader user={user} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Manage Availability</h1>
              <p className="text-slate-600 mt-1">Control your schedule and time-off</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Emergency Unavailability */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Emergency Unavailability</h2>
              <p className="text-slate-600 text-sm mb-4">
                Quickly mark yourself as unavailable for urgent situations
              </p>
              
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleToggleEmergency}
                  variant={isEmergencyUnavailable ? 'secondary' : 'primary'}
                  className={isEmergencyUnavailable ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {isEmergencyUnavailable ? '🔴 Currently Unavailable' : '✅ Available'}
                </Button>
                
                {!isEmergencyUnavailable && (
                  <div className="flex gap-2 flex-1">
                    <Input
                      type="datetime-local"
                      placeholder="Until (optional)"
                      value={emergencyUntil}
                      onChange={(e) => setEmergencyUntil(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="text"
                      placeholder="Reason (optional)"
                      value={emergencyReason}
                      onChange={(e) => setEmergencyReason(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Weekly Schedule</h2>
              {isLoading ? (
                <p className="text-slate-500">Loading...</p>
              ) : availability.length === 0 ? (
                <p className="text-slate-500">No availability schedule set</p>
              ) : (
                <div className="space-y-2">
                  {availability.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-900">{getDayName(slot.day)}</span>
                      <span className="text-slate-600">{slot.startTime} - {slot.endTime}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Time-Off Management */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Time-Off Blocks</h2>
                <Button onClick={() => setShowAddTimeOff(!showAddTimeOff)}>
                  {showAddTimeOff ? 'Cancel' : '+ Add Time-Off'}
                </Button>
              </div>

              {showAddTimeOff && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                      <Input
                        type="date"
                        value={newTimeOff.startDate}
                        onChange={(e) => setNewTimeOff({ ...newTimeOff, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                      <Input
                        type="date"
                        value={newTimeOff.endDate}
                        onChange={(e) => setNewTimeOff({ ...newTimeOff, endDate: e.target.value })}
                        min={newTimeOff.startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                    <select
                      value={newTimeOff.type}
                      onChange={(e) => setNewTimeOff({ ...newTimeOff, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="vacation">Vacation</option>
                      <option value="sick-leave">Sick Leave</option>
                      <option value="conference">Conference</option>
                      <option value="personal">Personal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reason (Optional)</label>
                    <Input
                      type="text"
                      placeholder="e.g., Family vacation, Medical conference"
                      value={newTimeOff.reason}
                      onChange={(e) => setNewTimeOff({ ...newTimeOff, reason: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddTimeOff} className="w-full">
                    Add Time-Off
                  </Button>
                </div>
              )}

              {isLoading ? (
                <p className="text-slate-500">Loading...</p>
              ) : timeOff.length === 0 ? (
                <p className="text-slate-500">No time-off blocks scheduled</p>
              ) : (
                <div className="space-y-3">
                  {timeOff.map((block) => (
                    <div key={block._id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(block.type)}`}>
                            {block.type.replace('-', ' ')}
                          </span>
                          {block.isRecurring && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                              Recurring
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-slate-900">
                          {new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}
                        </p>
                        {block.reason && (
                          <p className="text-sm text-slate-600 mt-1">{block.reason}</p>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleDeleteTimeOff(block._id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
