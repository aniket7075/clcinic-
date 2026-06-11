import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import type { RootState } from '../store';
import { Calendar, Clock, MapPin, User as UserIcon } from 'lucide-react';

interface Schedule {
  id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  patient: {
    first_name: string;
    last_name: string;
  };
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MySchedule: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!user) return;

        // Fetch Weekly Schedule Settings
        const schedRes = await api.get(`/staff/schedule?doctorId=${user.id}`);
        setSchedules(schedRes.data);

        // Fetch Today's Appointments (Simple implementation using current date)
        const today = new Date().toISOString().split('T')[0];
        const apptRes = await api.get(`/appointments?date=${today}&doctorId=${user.id}`);
        setAppointments(apptRes.data.appointments || []);

      } catch (error) {
        console.error("Failed to fetch schedule data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200 p-6 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 text-[#6899B0] rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">My Schedule</h1>
            <p className="text-sm text-black">Manage your shifts and daily appointments</p>
          </div>
        </div>
        <div className="text-sm font-medium text-black bg-slate-100 px-4 py-2 rounded-lg">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Today's Appointments */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-black">Today's Appointments</h2>
            {loading ? (
              <div className="text-black py-10 text-center">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
                <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-black font-medium">No appointments scheduled for today.</p>
                <p className="text-slate-400 text-sm mt-1">Enjoy your free time or help out with walk-ins.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div key={appt.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#E0EEF5] text-[#6899B0] rounded-full flex items-center justify-center font-bold text-lg">
                        {appt.patient.first_name[0]}{appt.patient.last_name[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-black">{appt.patient.first_name} {appt.patient.last_name}</h4>
                        <div className="flex items-center space-x-3 text-sm text-black mt-1">
                          <span className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{appt.start_time.substring(0, 5)} - {appt.end_time.substring(0, 5)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      appt.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                      appt.status === 'SCHEDULED' ? 'bg-[#E0EEF5] text-[#5D8799] border-blue-200' :
                      appt.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-slate-50 text-black border-slate-200'
                    }`}>
                      {appt.status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Working Hours */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-black">Weekly Working Hours</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {loading ? (
                <div className="text-black py-10 text-center">Loading hours...</div>
              ) : schedules.length === 0 ? (
                <div className="p-6 text-center text-black text-sm">
                  No working hours configured.<br/>Please ask your administrator to set up your schedule.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {DAYS.map((dayName, index) => {
                    const daySchedules = schedules.filter(s => s.day_of_week === index && s.is_available);
                    const isToday = new Date().getDay() === index;
                    
                    return (
                      <div key={index} className={`p-4 flex items-center justify-between ${isToday ? 'bg-[#E0EEF5]/50' : ''}`}>
                        <div className="flex items-center space-x-3">
                          <span className={`w-2 h-2 rounded-full ${daySchedules.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                          <span className={`font-medium ${isToday ? 'text-[#5D8799]' : 'text-black'}`}>{dayName}</span>
                        </div>
                        <div className="text-sm text-black">
                          {daySchedules.length > 0 ? (
                            daySchedules.map(ds => (
                              <div key={ds.id}>{ds.start_time.substring(0, 5)} - {ds.end_time.substring(0, 5)}</div>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">Off</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default MySchedule;
