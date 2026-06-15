import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Clock, User, Plus, MessageCircle } from 'lucide-react';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    start_time: '',
    end_time: '',
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
      // Filter for doctors
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
        appointment_date: '',
        start_time: '',
        end_time: '',
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
    
    // Format date and time
    const aptDate = new Date(apt.appointment_date).toLocaleDateString('mr-IN');
    const aptTime = apt.start_time.substring(0, 5);
    const doctorName = apt.profiles?.last_name || '';
    const patientName = apt.patients?.first_name || 'Patient';
    
    // Create Marathi message
    const message = `नमस्कार ${patientName},\n\nतुमची Q DENT Clinic मध्ये ${aptDate} ला ${aptTime} वाजता डॉ. ${doctorName} यांच्याकडे अपॉईंटमेंट आहे. कृपया वेळेवर उपस्थित राहा.\n\nधन्यवाद!\n- Q DENT Clinic`;
    
    // Clean phone number (add 91 if not present, though assuming 10 digits for India)
    let phone = apt.patients.mobile.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Appointments Schedule</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-colors"
        >
          <Plus size={18} />
          New Appointment
        </button>
      </div>

      {loading ? (
        <p className="text-black">Loading schedule...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-6 bg-slate-50 border-b border-slate-200 p-4 font-semibold text-black text-sm">
            <div>Date</div>
            <div>Time</div>
            <div>Patient</div>
            <div>Doctor</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <div key={apt.id} className="grid grid-cols-6 p-4 items-center hover:bg-slate-50 transition-colors">
                <div className="font-medium text-black">{new Date(apt.appointment_date).toLocaleDateString()}</div>
                <div className="flex items-center gap-2 text-black">
                  <Clock size={16} />
                  {apt.start_time.substring(0, 5)} - {apt.end_time.substring(0, 5)}
                </div>
                <div className="flex items-center gap-2 text-black font-medium">
                  <User size={16} className="text-slate-400" />
                  {apt.patients?.first_name} {apt.patients?.last_name}
                </div>
                <div className="text-black">Dr. {apt.profiles?.last_name}</div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    apt.status === 'SCHEDULED' ? 'bg-blue-100 text-[#5D8799]' :
                    apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-black'
                  }`}>
                    {apt.status}
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  {apt.status === 'SCHEDULED' && (
                    <>
                      <button onClick={() => updateStatus(apt.id, 'COMPLETED')} className="px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">Complete</button>
                      <button onClick={() => updateStatus(apt.id, 'CANCELLED')} className="px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100">Cancel</button>
                      <button 
                        onClick={() => sendWhatsAppReminder(apt)} 
                        className="px-2 py-1 bg-[#25D366]/10 text-[#25D366] rounded hover:bg-[#25D366]/20 flex items-center gap-1 font-medium"
                        title="Send WhatsApp Reminder"
                      >
                        <MessageCircle size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="p-8 text-center text-black">No appointments found.</div>
            )}
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient</label>
                <select 
                  required 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none"
                  value={formData.patient_id}
                  onChange={e => setFormData({...formData, patient_id: e.target.value})}
                >
                  <option value="">Select Patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Doctor</label>
                <select 
                  required 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none"
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
                <label className="block text-sm font-medium mb-1">Date</label>
                <input 
                  required 
                  type="date"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none"
                  value={formData.appointment_date}
                  onChange={e => setFormData({...formData, appointment_date: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input 
                    required 
                    type="time"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none"
                    value={formData.start_time}
                    onChange={e => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input 
                    required 
                    type="time"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none"
                    value={formData.end_time}
                    onChange={e => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Reason / Notes</label>
                <textarea 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none"
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] disabled:opacity-50">
                  {submitting ? 'Booking...' : 'Book Appointment'}
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
