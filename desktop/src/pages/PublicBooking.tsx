import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, Phone, CheckCircle, Clock } from 'lucide-react';

const PublicBooking: React.FC = () => {
  const { clinicId } = useParams();
  const [clinic, setClinic] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    doctor_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    notes: ''
  });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/public/booking/${clinicId}`);
        setClinic(res.data.clinic);
        setDoctors(res.data.doctors || []);
      } catch (err) {
        console.error('Error fetching clinic info:', err);
      } finally {
        setLoading(false);
      }
    };
    if (clinicId) fetchInfo();
  }, [clinicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/api/public/booking/${clinicId}`, formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting booking:', err);
      alert('Failed to submit booking. Please try calling the clinic directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading Booking Portal...</div>;
  }

  if (!clinic) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-bold">Clinic Not Found.</div>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl shadow-xl p-10 max-w-md w-full text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-black mb-2">Request Received!</h1>
          <p className="text-slate-600 mb-8">We have received your appointment request. Our reception team will contact you shortly to confirm the booking.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#6899B0] text-white font-bold rounded-lg hover:bg-[#5D8799] transition-colors w-full">
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Clinic Info */}
        <div className="bg-slate-900 text-white p-8 md:w-1/3 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-black mb-2 leading-tight">{clinic.name}</h1>
            <p className="text-slate-400 text-sm mb-8">{clinic.address}</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Phone size={18} className="text-[#6899B0]" />
                <span className="font-medium text-sm">{clinic.phone}</span>
              </div>
            </div>
          </div>
          <div className="mt-12 text-xs font-bold text-slate-500 tracking-widest uppercase">
            Powered by Q DENT
          </div>
        </div>

        {/* Right Side: Booking Form */}
        <div className="p-8 md:w-2/3">
          <h2 className="text-xl font-bold text-black mb-6">Request Appointment</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><User size={14}/> First Name</label>
                <input 
                  required 
                  type="text"
                  className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none font-medium text-black bg-slate-50"
                  value={formData.first_name}
                  onChange={e => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                <input 
                  required 
                  type="text"
                  className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none font-medium text-black bg-slate-50"
                  value={formData.last_name}
                  onChange={e => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><Phone size={14}/> Mobile Number</label>
              <input 
                required 
                type="tel"
                placeholder="e.g. 9876543210"
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none font-medium text-black bg-slate-50"
                value={formData.mobile}
                onChange={e => setFormData({...formData, mobile: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Select Doctor</label>
              <select 
                required 
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none font-medium text-black bg-slate-50"
                value={formData.doctor_id}
                onChange={e => setFormData({...formData, doctor_id: e.target.value})}
              >
                <option value="">Choose a doctor...</option>
                {doctors.map(d => (
                  <option key={d.profile_id} value={d.profile_id}>
                    Dr. {d.profiles?.first_name} {d.profiles?.last_name} {d.profiles?.specialty ? `(${d.profiles.specialty})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><Calendar size={14}/> Preferred Date</label>
                <input 
                  required 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none font-medium text-black bg-slate-50"
                  value={formData.appointment_date}
                  onChange={e => setFormData({...formData, appointment_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><Clock size={14}/> Preferred Time</label>
                <input 
                  required 
                  type="time"
                  className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none font-medium text-black bg-slate-50"
                  value={formData.start_time}
                  onChange={e => setFormData({...formData, start_time: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Reason for Visit (Optional)</label>
              <textarea 
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none text-black bg-slate-50"
                rows={2}
                placeholder="Toothache, cleaning, etc..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              ></textarea>
            </div>

            <button type="submit" disabled={submitting} className="w-full py-4 bg-[#6899B0] text-white font-bold text-lg rounded-lg hover:bg-[#5D8799] disabled:opacity-50 transition-colors shadow-lg mt-4">
              {submitting ? 'Submitting Request...' : 'Book Appointment'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PublicBooking;
