import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar as CalendarIcon, User, Plus, MessageCircle } from 'lucide-react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enIN } from 'date-fns/locale/en-IN';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-IN': enIN,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(new Date());

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '10:30',
    notes: ''
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.appointments || res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [patientsRes, staffRes] = await Promise.all([
        api.get('/patients'),
        api.get('/staff')
      ]);
      setPatients(patientsRes.data.patients || patientsRes.data);
      const staffList = staffRes.data.staff || staffRes.data;
      setDoctors(staffList.filter((s: any) => s.profiles?.role === 'DOCTOR'));
    } catch (err) {
      console.error('Error fetching dependencies:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDependencies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/appointments', formData);
      setShowModal(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        appointment_date: new Date().toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '10:30',
        notes: ''
      });
      fetchAppointments();
    } catch (err) {
      console.error('Error creating appointment:', err);
      alert('Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const sendWhatsAppReminder = (apt: any) => {
    if (!apt.patients?.mobile) {
      alert("Patient mobile number not available.");
      return;
    }
    const aptDate = new Date(apt.appointment_date).toLocaleDateString('mr-IN');
    const aptTime = apt.start_time.substring(0, 5);
    const doctorName = apt.profiles?.last_name || '';
    const patientName = apt.patients?.first_name || 'Patient';
    const message = `नमस्कार ${patientName},\n\nतुमची Q DENT Clinic मध्ये ${aptDate} ला ${aptTime} वाजता डॉ. ${doctorName} यांच्याकडे अपॉईंटमेंट आहे. कृपया वेळेवर उपस्थित राहा.\n\nधन्यवाद!\n- Q DENT Clinic`;
    let phone = apt.patients.mobile.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Convert API data to react-big-calendar events
  const events = appointments.map(apt => {
    const startDate = new Date(`${apt.appointment_date}T${apt.start_time}`);
    const endDate = new Date(`${apt.appointment_date}T${apt.end_time}`);
    return {
      id: apt.id,
      title: `${apt.patients?.first_name} ${apt.patients?.last_name} (${apt.status})`,
      start: startDate,
      end: endDate,
      resource: apt
    };
  });

  const eventStyleGetter = (event: any) => {
    const status = event.resource.status;
    let backgroundColor = '#3b82f6'; // SCHEDULED
    if (status === 'COMPLETED') backgroundColor = '#10b981';
    if (status === 'CANCELLED') backgroundColor = '#ef4444';
    if (status === 'IN_PROGRESS') backgroundColor = '#f59e0b';

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setFormData({
      ...formData,
      appointment_date: format(start, 'yyyy-MM-dd'),
      start_time: format(start, 'HH:mm'),
      end_time: format(end, 'HH:mm'),
    });
    setShowModal(true);
  };

  const handleSelectEvent = (event: any) => {
    // We could open a detail modal here. For now, prompt for status update if scheduled.
    if (event.resource.status === 'SCHEDULED') {
      const action = prompt('Enter action: 1 to Complete, 2 to Cancel, 3 for WhatsApp Reminder');
      if (action === '1') updateStatus(event.resource.id, 'COMPLETED');
      if (action === '2') updateStatus(event.resource.id, 'CANCELLED');
      if (action === '3') sendWhatsAppReminder(event.resource);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2">
          <CalendarIcon className="text-[#6899B0]" /> Smart Scheduling
        </h1>
        <button 
          onClick={() => {
            setFormData({ ...formData, appointment_date: format(new Date(), 'yyyy-MM-dd') });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-colors shadow-sm font-medium"
        >
          <Plus size={18} />
          New Appointment
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 relative min-h-[600px]">
        {loading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">Loading...</div>}
        
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          step={15}
          timeslots={4}
          min={new Date(0, 0, 0, 8, 0, 0)} // 8 AM
          max={new Date(0, 0, 0, 21, 0, 0)} // 9 PM
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4 border-b border-slate-100 pb-2">Book Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Patient</label>
                <select 
                  required 
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none bg-slate-50"
                  value={formData.patient_id}
                  onChange={e => setFormData({...formData, patient_id: e.target.value})}
                >
                  <option value="">Select Patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.mobile})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Doctor</label>
                <select 
                  required 
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none bg-slate-50"
                  value={formData.doctor_id}
                  onChange={e => setFormData({...formData, doctor_id: e.target.value})}
                >
                  <option value="">Select Doctor...</option>
                  {doctors.map(d => (
                    <option key={d.profile_id} value={d.profile_id}>Dr. {d.profiles?.first_name} {d.profiles?.last_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                <input 
                  required 
                  type="date"
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none bg-slate-50"
                  value={formData.appointment_date}
                  onChange={e => setFormData({...formData, appointment_date: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Start Time</label>
                  <input 
                    required 
                    type="time"
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none bg-slate-50"
                    value={formData.start_time}
                    onChange={e => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">End Time</label>
                  <input 
                    required 
                    type="time"
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none bg-slate-50"
                    value={formData.end_time}
                    onChange={e => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Reason / Notes</label>
                <textarea 
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none bg-slate-50"
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#6899B0] text-white font-bold rounded-lg hover:bg-[#5D8799] disabled:opacity-50 transition-colors shadow-sm">
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
