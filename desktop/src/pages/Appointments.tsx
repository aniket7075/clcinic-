import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Appointments: React.FC = () => {
  const { t } = useTranslation();
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

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);

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
    setSelectedEvent(event.resource);
    setShowEventModal(true);
  };

  const handleUpdateStatus = async (status: string) => {
    if (selectedEvent) {
      await updateStatus(selectedEvent.id, status);
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2">
          <CalendarIcon className="text-[#6899B0]" /> {t('appointments.title')}
        </h1>
        <button 
          onClick={() => {
            setFormData({ ...formData, appointment_date: format(new Date(), 'yyyy-MM-dd') });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-colors shadow-sm font-medium"
        >
          <Plus size={18} />
          {t('appointments.newAppointment')}
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 relative min-h-[600px]">
        {loading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">{t('appointments.loading')}</div>}
        
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={(newView: any) => setView(newView)}
          date={date}
          onNavigate={(newDate: any) => setDate(newDate)}
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
            <h2 className="text-xl font-bold mb-4 border-b border-slate-100 pb-2">{t('appointments.bookAppointment')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('appointments.patient')}</label>
                <select 
                  required 
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none bg-slate-50"
                  value={formData.patient_id}
                  onChange={e => setFormData({...formData, patient_id: e.target.value})}
                >
                  <option value="">{t('appointments.selectPatient')}</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.mobile})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('appointments.doctor')}</label>
                <select 
                  required 
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none bg-slate-50"
                  value={formData.doctor_id}
                  onChange={e => setFormData({...formData, doctor_id: e.target.value})}
                >
                  <option value="">{t('appointments.selectDoctor')}</option>
                  {doctors.map(d => (
                    <option key={d.profile_id} value={d.profile_id}>Dr. {d.profiles?.first_name} {d.profiles?.last_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('appointments.date')}</label>
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
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('appointments.startTime')}</label>
                  <input 
                    required 
                    type="time"
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none bg-slate-50"
                    value={formData.start_time}
                    onChange={e => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('appointments.endTime')}</label>
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
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('appointments.reasonNotes')}</label>
                <input 
                  list="visit-reasons"
                  type="text"
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none bg-slate-50"
                  placeholder={t('appointments.reasonPlaceholder')}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">{t('appointments.cancel')}</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#6899B0] text-white font-bold rounded-lg hover:bg-[#5D8799] disabled:opacity-50 transition-colors shadow-sm">
                  {submitting ? t('appointments.booking') : t('appointments.confirmBooking')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">{t('appointments.details', 'Appointment Details')}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedEvent.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                selectedEvent.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                selectedEvent.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {selectedEvent.status}
              </span>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500 font-medium">Patient Name</p>
                <p className="text-lg font-bold text-slate-900">
                  {selectedEvent.patients?.first_name} {selectedEvent.patients?.last_name}
                </p>
                <p className="text-sm text-slate-600">{selectedEvent.patients?.mobile}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Doctor</p>
                  <p className="text-md font-semibold text-slate-800">
                    Dr. {selectedEvent.profiles?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Date & Time</p>
                  <p className="text-md font-semibold text-slate-800">
                    {new Date(selectedEvent.appointment_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedEvent.start_time.substring(0, 5)} - {selectedEvent.end_time.substring(0, 5)}
                  </p>
                </div>
              </div>

              {selectedEvent.notes && (
                <div>
                  <p className="text-sm text-slate-500 font-medium">Reason / Notes</p>
                  <p className="text-sm text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                    {selectedEvent.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-6 flex flex-col gap-3 border-t border-slate-100">
              <button 
                onClick={() => sendWhatsAppReminder(selectedEvent)}
                className="w-full py-2.5 bg-[#25D366] text-white font-bold rounded-lg hover:bg-[#128C7E] transition-colors shadow-sm flex justify-center items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
                Send WhatsApp Reminder
              </button>
              
              {selectedEvent.status === 'SCHEDULED' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    className="flex-1 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Mark Completed
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('CANCELLED')}
                    className="flex-1 py-2 bg-white text-red-600 border border-red-200 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel Appt
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="w-full mt-2 py-2 text-slate-500 font-medium hover:text-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <datalist id="visit-reasons">
        <option value="Toothache / Pain" />
        <option value="Teeth Cleaning / Scaling" />
        <option value="Routine Checkup / Consultation" />
        <option value="Bleeding / Swollen Gums" />
        <option value="Broken / Chipped Tooth" />
        <option value="Cavity / Dental Filling" />
        <option value="Root Canal Consultation" />
        <option value="Braces / Aligners Consultation" />
        <option value="Teeth Whitening" />
        <option value="Wisdom Tooth Pain" />
        <option value="Denture / Crown Fitting" />
      </datalist>
    </div>
  );
};

export default Appointments;
