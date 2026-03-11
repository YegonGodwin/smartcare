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
  const [editingAvailability, setEditingAvailability] = useState<Availability[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
  const [isEmergencyUnavailable, setIsEmergencyUnavailable] = useState(false);
  const [emergencyUntil, setEmergencyUntil] = useState('');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddTimeOff, setShowAddTimeOff] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  
  // Time-off form state
  const [newTimeOff, setNewTimeOff] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'vacation' as const
  });

  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    if (doctorId) {
      fetchAvailability();
    }
  }, [doctorId]);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiRequest<{ data: any }>(`/availability/${doctorId}`);
      setAvailability(response.data.availability || []);
      setEditingAvailability(response.data.availability || []);
      setTimeOff(response.data.timeOff || []);
      setIsEmergencyUnavailable(response.data.isEmergencyUnavailable || false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSchedule = () => {
    setIsEditingSchedule(true);
    setEditingAvailability([...availability]);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setIsEditingSchedule(false);
    setEditingAvailability([...availability]);
    setError(null);
  };

  const handleDayToggle = (day: string) => {
    const exists = editingAvailability.find(a => a.day === day);
    if (exists) {
      setEditingAvailability(editingAvailability.filter(a => a.day !== day));
    } else {
      setEditingAvailability([...editingAvailability, { day, startTime: '09:00', endTime: '17:00' }]);
    }
  };

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setEditingAvailability(editingAvailability.map(a => 
      a.day === day ? { ...a, [field]: value } : a
    ));
  };

  const handleSaveSchedule = async () => {
    // Validation
    for (const slot of editingAvailability) {
      if (slot.startTime >= slot.endTime) {
        setError(`${getDayName(slot.day)}: Start time must be before end time`);
        return;
      }
    }

    try {
      setIsSaving(true);
      setError(null);
      await apiRequest(`/availability/${doctorId}/schedule`, {
        method: 'PUT',
        body: JSON.stringify({ availability: editingAvailability })
      });
      
      setSuccess('Schedule updated successfully!');
      setIsEditingSchedule(false);
      fetchAvailability();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSchedule = (type: 'weekdays' | 'full-week' | 'extended') => {
    let schedule: Availability[] = [];
    
    switch (type) {
      case 'weekdays':
        schedule = [
          { day: 'monday', startTime: '09:00', endTime: '17:00' },
          { day: 'tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'friday', startTime: '09:00', endTime: '17:00' }
        ];
        break;
      case 'full-week':
        schedule = [
          { day: 'monday', startTime: '09:00', endTime: '17:00' },
          { day: 'tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'friday', startTime: '09:00', endTime: '17:00' },
          { day: 'saturday', startTime: '09:00', endTime: '13:00' }
        ];
        break;
      case 'extended':
        schedule = [
          { day: 'monday', startTime: '08:00', endTime: '18:00' },
          { day: 'tuesday', startTime: '08:00', endTime: '18:00' },
          { day: 'wednesday', startTime: '08:00', endTime: '18:00' },
          { day: 'thursday', startTime: '08:00', endTime: '18:00' },
          { day: 'friday', startTime: '08:00', endTime: '18:00' }
        ];
        break;
    }
    
    setEditingAvailability(schedule);
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm font-medium">Working Days</span>
                  <span className="text-3xl">📅</span>
                </div>
                <p className="text-3xl font-bold">{availability.length}</p>
                <p className="text-blue-100 text-sm mt-1">days per week</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-100 text-sm font-medium">Total Hours</span>
                  <span className="text-3xl">⏰</span>
                </div>
                <p className="text-3xl font-bold">
                  {availability.reduce((total, slot) => {
                    const start = slot.startTime.split(':').map(Number);
                    const end = slot.endTime.split(':').map(Number);
                    return total + (end[0] - start[0] + (end[1] - start[1]) / 60);
                  }, 0).toFixed(1)}
                </p>
                <p className="text-green-100 text-sm mt-1">hours per week</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-100 text-sm font-medium">Upcoming Time-Off</span>
                  <span className="text-3xl">🏖️</span>
                </div>
                <p className="text-3xl font-bold">
                  {timeOff.filter(t => new Date(t.endDate) >= new Date()).length}
                </p>
                <p className="text-purple-100 text-sm mt-1">scheduled blocks</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                {success}
              </div>
            )}

            {/* Emergency Unavailability */}
            <div className={`rounded-2xl border shadow-sm p-6 transition-all ${
              isEmergencyUnavailable 
                ? 'bg-red-50 border-red-300' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {isEmergencyUnavailable ? '🔴' : '🟢'} Emergency Unavailability
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Quickly mark yourself as unavailable for urgent situations
                  </p>
                </div>
                {isEmergencyUnavailable && (
                  <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full animate-pulse">
                    Currently Unavailable
                  </span>
                )}
              </div>
              
              {!isEmergencyUnavailable ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Unavailable Until (Optional)
                      </label>
                      <Input
                        type="datetime-local"
                        value={emergencyUntil}
                        onChange={(e) => setEmergencyUntil(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      <p className="text-xs text-slate-500 mt-1">Leave empty for indefinite</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Reason (Optional)
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., Medical emergency, Family matter"
                        value={emergencyReason}
                        onChange={(e) => setEmergencyReason(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleToggleEmergency}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    🚨 Mark as Unavailable
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-red-200 rounded-lg">
                    <p className="text-red-900 font-medium mb-2">
                      You are currently marked as unavailable
                    </p>
                    {emergencyUntil && (
                      <p className="text-sm text-red-700">
                        Until: {new Date(emergencyUntil).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                    {emergencyReason && (
                      <p className="text-sm text-red-700 mt-1">
                        Reason: {emergencyReason}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleToggleEmergency}
                    variant="secondary"
                    className="w-full border-green-600 text-green-700 hover:bg-green-50"
                  >
                    ✅ Mark as Available Again
                  </Button>
                </div>
              )}
            </div>

            {/* Weekly Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Weekly Schedule</h2>
                  <p className="text-slate-600 text-sm mt-1">Set your working hours for each day</p>
                </div>
                {!isEditingSchedule && (
                  <Button onClick={handleEditSchedule}>
                    ✏️ Edit Schedule
                  </Button>
                )}
              </div>

              {isLoading ? (
                <p className="text-slate-500">Loading...</p>
              ) : isEditingSchedule ? (
                <div className="space-y-6">
                  {/* Quick Schedule Templates */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-3">Quick Templates:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleQuickSchedule('weekdays')}
                        className="px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        📅 Weekdays (Mon-Fri, 9 AM - 5 PM)
                      </button>
                      <button
                        onClick={() => handleQuickSchedule('full-week')}
                        className="px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        📆 Full Week (Mon-Sat)
                      </button>
                      <button
                        onClick={() => handleQuickSchedule('extended')}
                        className="px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        ⏰ Extended Hours (8 AM - 6 PM)
                      </button>
                    </div>
                  </div>

                  {/* Day-by-Day Configuration */}
                  <div className="space-y-3">
                    {allDays.map((day) => {
                      const daySlot = editingAvailability.find(a => a.day === day);
                      const isActive = !!daySlot;

                      return (
                        <div key={day} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleDayToggle(day)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="font-medium text-slate-900 w-28">
                                {getDayName(day)}
                              </span>
                            </label>

                            {isActive && daySlot && (
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <label className="text-sm text-slate-600">From:</label>
                                  <input
                                    type="time"
                                    value={daySlot.startTime}
                                    onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <span className="text-slate-400">→</span>
                                <div className="flex items-center gap-2">
                                  <label className="text-sm text-slate-600">To:</label>
                                  <input
                                    type="time"
                                    value={daySlot.endTime}
                                    onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <span className="text-sm text-slate-500 ml-auto">
                                  {(() => {
                                    const start = daySlot.startTime.split(':').map(Number);
                                    const end = daySlot.endTime.split(':').map(Number);
                                    const hours = end[0] - start[0] + (end[1] - start[1]) / 60;
                                    return `${hours.toFixed(1)} hrs`;
                                  })()}
                                </span>
                              </div>
                            )}

                            {!isActive && (
                              <span className="text-slate-400 text-sm italic">Not available</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button
                      onClick={handleSaveSchedule}
                      disabled={isSaving || editingAvailability.length === 0}
                      className="flex-1"
                    >
                      {isSaving ? 'Saving...' : '💾 Save Schedule'}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="secondary"
                      disabled={isSaving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>

                  {editingAvailability.length === 0 && (
                    <p className="text-amber-600 text-sm text-center">
                      ⚠️ Please select at least one day to be available
                    </p>
                  )}
                </div>
              ) : availability.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 mb-4">No availability schedule set</p>
                  <Button onClick={handleEditSchedule}>
                    Set Up Your Schedule
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {allDays.map((day) => {
                    const slot = availability.find(a => a.day === day);
                    return (
                      <div key={day} className={`flex items-center justify-between p-3 rounded-lg ${
                        slot ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
                      }`}>
                        <span className="font-medium text-slate-900 w-32">{getDayName(day)}</span>
                        {slot ? (
                          <div className="flex items-center gap-4">
                            <span className="text-slate-700">{slot.startTime} - {slot.endTime}</span>
                            <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                              ✓ Available
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm italic">Not available</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Time-Off Management */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Time-Off Blocks</h2>
                  <p className="text-slate-600 text-sm mt-1">Schedule vacations, conferences, and other time away</p>
                </div>
                <Button onClick={() => setShowAddTimeOff(!showAddTimeOff)}>
                  {showAddTimeOff ? '✕ Cancel' : '+ Add Time-Off'}
                </Button>
              </div>

              {showAddTimeOff && (
                <div className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200 rounded-xl space-y-4">
                  <h3 className="font-semibold text-slate-900 mb-4">Schedule New Time-Off</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={newTimeOff.startDate}
                        onChange={(e) => setNewTimeOff({ ...newTimeOff, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={newTimeOff.endDate}
                        onChange={(e) => setNewTimeOff({ ...newTimeOff, endDate: e.target.value })}
                        min={newTimeOff.startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                      <select
                        value={newTimeOff.type}
                        onChange={(e) => setNewTimeOff({ ...newTimeOff, type: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="vacation">🏖️ Vacation</option>
                        <option value="sick-leave">🤒 Sick Leave</option>
                        <option value="conference">🎓 Conference</option>
                        <option value="personal">👤 Personal</option>
                        <option value="other">📋 Other</option>
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
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleAddTimeOff} className="flex-1">
                      ✓ Add Time-Off
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setShowAddTimeOff(false);
                        setNewTimeOff({ startDate: '', endDate: '', reason: '', type: 'vacation' });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <p className="text-slate-500">Loading...</p>
              ) : timeOff.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <span className="text-6xl mb-4 block">📅</span>
                  <p className="text-slate-500 mb-2">No time-off blocks scheduled</p>
                  <p className="text-slate-400 text-sm">Click "Add Time-Off" to schedule time away</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeOff
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .map((block) => {
                      const isPast = new Date(block.endDate) < new Date();
                      const isActive = new Date(block.startDate) <= new Date() && new Date(block.endDate) >= new Date();
                      
                      return (
                        <div 
                          key={block._id} 
                          className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                            isActive 
                              ? 'border-amber-300 bg-amber-50' 
                              : isPast 
                              ? 'border-slate-200 bg-slate-50 opacity-60' 
                              : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(block.type)}`}>
                                {block.type === 'vacation' && '🏖️'}
                                {block.type === 'sick-leave' && '🤒'}
                                {block.type === 'conference' && '🎓'}
                                {block.type === 'personal' && '👤'}
                                {block.type === 'other' && '📋'}
                                {' '}{block.type.replace('-', ' ')}
                              </span>
                              {block.isRecurring && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                  🔄 Recurring
                                </span>
                              )}
                              {isActive && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                  ⚡ Active Now
                                </span>
                              )}
                              {isPast && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                                  ✓ Completed
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-slate-900 mb-1">
                              {new Date(block.startDate).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })} 
                              {' → '}
                              {new Date(block.endDate).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                            {block.reason && (
                              <p className="text-sm text-slate-600 mt-1">💬 {block.reason}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-2">
                              Duration: {Math.ceil((new Date(block.endDate).getTime() - new Date(block.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </p>
                          </div>
                          {!isPast && (
                            <Button
                              variant="secondary"
                              onClick={() => handleDeleteTimeOff(block._id)}
                              className="text-red-600 hover:bg-red-50 ml-4"
                            >
                              🗑️ Delete
                            </Button>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
