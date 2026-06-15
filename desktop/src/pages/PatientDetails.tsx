import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import api from '../api/axios';
import { Plus, Trash2, Pill, FileText, Download, MessageCircle } from 'lucide-react';

const ToothIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2c-2.3 0-4.1 1.4-4 3.7c.1-2.3-1.7-3.7-4-3.7C5.2 2 3 4.2 3 7c0 3.8 2 6 2.8 11.5c.2 1.5 1.4 2.5 2.8 2.5c1.4 0 2.5-1.2 2.5-2.5C11.1 16.5 12 14 12 14s.9 2.5.9 4.5c0 1.3 1.1 2.5 2.5 2.5c1.4 0 2.6-1 2.8-2.5C19 13 21 10.8 21 7C21 4.2 18.8 2 16 2z"/>
  </svg>
);

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [timeline, setTimeline] = useState<{history: any[], prescriptions: any[], appointments: any[]}>({ history: [], prescriptions: [], appointments: [] });
  const [dentalChart, setDentalChart] = useState<any[]>([]);
  
  // Modals / Forms
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Form States
  const [noteForm, setNoteForm] = useState({
    symptoms: '', diagnosis: '', treatment: '', notes: ''
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    instructions: '',
    items: [{ medicine_name: '', dosage: '', frequency: '', duration: '' }]
  });
  
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const userProfileId = useSelector((state: RootState) => state.auth.user?.id); // We need a doctor ID for prescriptions
  const isDoctor = userRole === 'DOCTOR';

  const fetchPatient = async () => {
    try {
      const res = await api.get(`/patients/${id}`);
      setPatient(res.data.patient || res.data);
    } catch (err) {
      console.error('Error fetching patient details:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/patients/${id}/timeline`);
      setTimeline(res.data);
    } catch (err) {
      console.error('Error fetching medical history timeline:', err);
    }
  };

  const fetchChart = async () => {
    try {
      const res = await api.get(`/treatments/${id}/chart`);
      setDentalChart(res.data || []);
    } catch (err) {
      console.error('Error fetching dental chart:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatient();
      fetchHistory();
      fetchChart();
    }
  }, [id]);

  const handleUpdateTooth = async (toothNumber: number, status: string) => {
    try {
      await api.put(`/treatments/${id}/chart/${toothNumber}`, {
        status,
        notes: '',
        updated_by: userProfileId
      });
      fetchChart();
    } catch (err) {
      console.error('Error updating tooth:', err);
      alert('Failed to update tooth status.');
    }
  };

  const handleDownloadPrescription = async (prescriptionId: string) => {
    try {
      const response = await api.get(`/treatments/prescriptions/${prescriptionId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading prescription PDF:', err);
      alert('Failed to download PDF');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/treatments/history`, {
        patient_id: id,
        visit_date: new Date().toISOString().split('T')[0],
        symptoms: noteForm.symptoms,
        diagnosis: noteForm.diagnosis,
        treatment: noteForm.treatment,
        notes: noteForm.notes,
        updated_by: userProfileId
      });
      setNoteForm({ symptoms: '', diagnosis: '', treatment: '', notes: '' });
      setShowNoteForm(false);
      fetchHistory();
    } catch (err) {
      console.error('Error adding medical history:', err);
      alert('Error adding medical history');
    }
  };

  const handlePrescriptionItemChange = (index: number, field: string, value: string) => {
    const newItems = [...prescriptionForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setPrescriptionForm({ ...prescriptionForm, items: newItems });
  };

  const addPrescriptionItem = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      items: [...prescriptionForm.items, { medicine_name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removePrescriptionItem = (index: number) => {
    const newItems = prescriptionForm.items.filter((_, i) => i !== index);
    setPrescriptionForm({ ...prescriptionForm, items: newItems });
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/treatments/prescriptions`, {
        patient_id: id,
        doctor_id: userProfileId,
        instructions: prescriptionForm.instructions,
        items: prescriptionForm.items
      });
      setShowPrescriptionModal(false);
      setPrescriptionForm({
        instructions: '',
        items: [{ medicine_name: '', dosage: '', frequency: '', duration: '' }]
      });
      fetchHistory();
    } catch (err) {
      console.error('Error adding prescription:', err);
      alert('Error adding prescription');
    }
  };

  const sendWhatsAppMessage = () => {
    if (!patient?.mobile) return;
    
    // Clean phone number (add 91 if not present)
    let phone = patient.mobile.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    
    // Simple greeting message
    const message = `नमस्कार ${patient.first_name},\n\nQ DENT Clinic मधून संपर्क साधत आहोत. `;
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!patient) return <div className="p-8">Loading patient details...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-black mb-2">
            {patient.first_name} {patient.last_name}
          </h1>
          <div className="text-black space-y-1">
            <p><span className="font-medium text-black">Case Number:</span> {patient.case_number}</p>
            <div className="flex items-center gap-2">
              <p><span className="font-medium text-black">Mobile:</span> {patient.mobile}</p>
              <button 
                onClick={sendWhatsAppMessage}
                className="text-[#25D366] hover:text-[#1da851] p-1 rounded-full hover:bg-[#25D366]/10 transition-colors"
                title="Message on WhatsApp"
              >
                <MessageCircle size={16} />
              </button>
            </div>
            <p><span className="font-medium text-black">Age/Gender:</span> {patient.age} / {patient.gender}</p>
          </div>
        </div>
        
        {isDoctor && (
          <div className="flex gap-3">
            <button 
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E0EEF5] text-[#5D8799] font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText size={18} />
              Add Clinical Note
            </button>
            <button 
              onClick={() => setShowPrescriptionModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[oklch(0.78_0.03_206.04)]/10 text-[oklch(0.6_0.03_206.04)] font-medium rounded-lg hover:bg-[oklch(0.78_0.03_206.04)]/20 transition-colors"
            >
              <Pill size={18} />
              Add Prescription
            </button>
          </div>
        )}
      </div>

      {showNoteForm && isDoctor && (
        <div className="bg-[#E0EEF5]/50 p-6 rounded-xl border border-blue-100 mb-8">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <FileText size={18} /> Record New Clinical Note
          </h3>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Symptoms</label>
                <input required type="text" className="w-full border border-slate-200 p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none bg-white" value={noteForm.symptoms} onChange={e => setNoteForm({...noteForm, symptoms: e.target.value})} placeholder="e.g. Toothache, Swelling..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Diagnosis</label>
                <input required type="text" className="w-full border border-slate-200 p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none bg-white" value={noteForm.diagnosis} onChange={e => setNoteForm({...noteForm, diagnosis: e.target.value})} placeholder="e.g. Dental Caries..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Treatment Provided</label>
              <input required type="text" className="w-full border border-slate-200 p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none bg-white" value={noteForm.treatment} onChange={e => setNoteForm({...noteForm, treatment: e.target.value})} placeholder="e.g. Root Canal Therapy..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Additional Notes / Description</label>
              <textarea
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none bg-white min-h-[100px]"
                placeholder="Enter detailed description..."
                value={noteForm.notes}
                onChange={(e) => setNoteForm({...noteForm, notes: e.target.value})}
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowNoteForm(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#6899B0] text-white font-medium rounded-lg hover:bg-[#5D8799] transition-colors">
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-black mb-6">Interactive Dental Chart</h2>
        <div className="flex flex-col gap-8">
          <div>
            <h3 className="text-sm font-semibold text-black mb-4 text-center uppercase tracking-wider">Upper Teeth</h3>
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              {Array.from({ length: 16 }, (_, i) => i + 1).map(num => {
                const rawStatus = dentalChart.find(t => t.tooth_number === num.toString())?.status || 'Healthy';
                const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
                let colorClass = 'text-green-500 drop-shadow-[0_2px_4px_rgba(34,197,94,0.4)]';
                if (status === 'Unhealthy' || status === 'Decayed') colorClass = 'text-red-500 drop-shadow-[0_2px_8px_rgba(239,68,68,0.6)]';
                if (status === 'Filled' || status === 'Filling') colorClass = 'text-blue-500 drop-shadow-[0_2px_8px_rgba(59,130,246,0.6)]';
                if (status === 'Missing') colorClass = 'text-slate-200 opacity-50';
                if (status === 'Extracted') colorClass = 'text-black';

                return (
                  <div key={num} className="flex flex-col items-center group">
                     <div className="text-xs font-bold text-black mb-1">{num}</div>
                     <div className="relative transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                       <ToothIcon 
                         className={`w-9 h-11 rotate-180 transition-all ${colorClass}`}
                       />
                       {isDoctor && (
                         <select
                           value={status === 'Decayed' ? 'Unhealthy' : status}
                           onChange={(e) => handleUpdateTooth(num, e.target.value)}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           title="Change tooth status"
                         >
                           <option value="Healthy">Healthy</option>
                           <option value="Unhealthy">Unhealthy</option>
                           <option value="Filled">Filled</option>
                           <option value="Missing">Missing</option>
                           <option value="Extracted">Extracted</option>
                         </select>
                       )}
                     </div>
                     <div className="text-[10px] mt-1 text-slate-400 capitalize whitespace-nowrap overflow-hidden text-ellipsis w-10 text-center">{status === 'Decayed' ? 'Unhealthy' : status}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-semibold text-black mb-4 text-center uppercase tracking-wider">Lower Teeth</h3>
            <div className="flex justify-center gap-2 flex-wrap">
              {Array.from({ length: 16 }, (_, i) => 32 - i).map(num => {
                const rawStatus = dentalChart.find(t => t.tooth_number === num.toString())?.status || 'Healthy';
                const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
                let colorClass = 'text-green-500 drop-shadow-[0_2px_4px_rgba(34,197,94,0.4)]';
                if (status === 'Unhealthy' || status === 'Decayed') colorClass = 'text-red-500 drop-shadow-[0_2px_8px_rgba(239,68,68,0.6)]';
                if (status === 'Filled' || status === 'Filling') colorClass = 'text-blue-500 drop-shadow-[0_2px_8px_rgba(59,130,246,0.6)]';
                if (status === 'Missing') colorClass = 'text-slate-200 opacity-50';
                if (status === 'Extracted') colorClass = 'text-black';

                return (
                  <div key={num} className="flex flex-col items-center group">
                     <div className="text-[10px] mb-1 text-slate-400 capitalize whitespace-nowrap overflow-hidden text-ellipsis w-10 text-center">{status === 'Decayed' ? 'Unhealthy' : status}</div>
                     <div className="relative transition-transform duration-300 group-hover:scale-110 group-hover:translate-y-1">
                       <ToothIcon 
                         className={`w-9 h-11 transition-all ${colorClass}`}
                       />
                       {isDoctor && (
                         <select
                           value={status === 'Decayed' ? 'Unhealthy' : status}
                           onChange={(e) => handleUpdateTooth(num, e.target.value)}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           title="Change tooth status"
                         >
                           <option value="Healthy">Healthy</option>
                           <option value="Unhealthy">Unhealthy</option>
                           <option value="Filled">Filled</option>
                           <option value="Missing">Missing</option>
                           <option value="Extracted">Extracted</option>
                         </select>
                       )}
                     </div>
                     <div className="text-xs font-bold text-black mt-1">{num}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-black">Treatment Timeline</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Clinical Notes Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black flex items-center gap-2 border-b pb-2">
              <FileText size={18} /> Clinical History
            </h3>
            {timeline.history.length > 0 ? (
              timeline.history.map((record, index) => (
                <div key={record.id || index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-[#5D8799] rounded uppercase tracking-wider">{new Date(record.visit_date).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-black">Diagnosis:</span> <span className="text-black">{record.diagnosis || '-'}</span></p>
                    <p><span className="font-medium text-black">Symptoms:</span> <span className="text-black">{record.symptoms || '-'}</span></p>
                    <p><span className="font-medium text-black">Treatment:</span> <span className="text-black">{record.treatment || '-'}</span></p>
                    <p><span className="font-medium text-black">Notes:</span> <span className="text-black">{record.notes || '-'}</span></p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">No clinical notes recorded.</p>
            )}
          </div>

          {/* Prescriptions Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black flex items-center gap-2 border-b pb-2">
              <Pill size={18} /> Prescriptions
            </h3>
            {timeline.prescriptions.length > 0 ? (
              timeline.prescriptions.map((px, index) => (
                <div key={px.id || index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold px-2 py-1 bg-[oklch(0.78_0.03_206.04)]/10 text-[oklch(0.6_0.03_206.04)] rounded uppercase tracking-wider">{new Date(px.prescription_date || px.created_at).toLocaleDateString()}</span>
                    <button 
                      onClick={() => handleDownloadPrescription(px.id)} 
                      className="text-black hover:text-[#6899B0] flex items-center gap-1"
                      title="Download PDF"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                  {px.instructions && (
                    <p className="text-sm text-black mb-3 italic">"{px.instructions}"</p>
                  )}
                  <div className="space-y-2">
                    {px.prescription_items?.map((item: any) => (
                      <div key={item.id} className="flex flex-col bg-slate-50 p-2 rounded text-sm border border-slate-100">
                        <span className="font-semibold text-black">{item.medicine_name}</span>
                        <div className="text-black flex justify-between mt-1 text-xs">
                          <span>{item.dosage}</span>
                          <span>{item.frequency}</span>
                          <span>{item.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">No prescriptions recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Prescription Modal */}
      {showPrescriptionModal && isDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-6 text-[oklch(0.6_0.03_206.04)]">
              <Pill size={24} />
              <h2 className="text-xl font-bold">Write Prescription</h2>
            </div>

            <form onSubmit={handleAddPrescription} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">General Instructions (Optional)</label>
                <textarea
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[oklch(0.78_0.03_206.04)] outline-none"
                  placeholder="e.g. Take medicines after meals..."
                  value={prescriptionForm.instructions}
                  onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                ></textarea>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium">Medicines</label>
                  <button type="button" onClick={addPrescriptionItem} className="text-sm text-[oklch(0.78_0.03_206.04)] font-medium hover:brightness-90 flex items-center gap-1">
                    <Plus size={14} /> Add Medicine
                  </button>
                </div>
                
                <div className="space-y-3">
                  {prescriptionForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-[oklch(0.78_0.03_206.04)]/10 p-3 rounded-lg border border-[oklch(0.78_0.03_206.04)]/20">
                      <div className="flex-1 space-y-3">
                        <input 
                          required 
                          type="text" 
                          placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                          className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-[oklch(0.78_0.03_206.04)]"
                          value={item.medicine_name}
                          onChange={e => handlePrescriptionItemChange(index, 'medicine_name', e.target.value)}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input 
                            required 
                            type="text" 
                            placeholder="Dosage (e.g. 1 Tablet)"
                            className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-[oklch(0.78_0.03_206.04)]"
                            value={item.dosage}
                            onChange={e => handlePrescriptionItemChange(index, 'dosage', e.target.value)}
                          />
                          <input 
                            required 
                            type="text" 
                            placeholder="Frequency (e.g. Twice a day)"
                            className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-[oklch(0.78_0.03_206.04)]"
                            value={item.frequency}
                            onChange={e => handlePrescriptionItemChange(index, 'frequency', e.target.value)}
                          />
                          <input 
                            required 
                            type="text" 
                            placeholder="Duration (e.g. 5 Days)"
                            className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-purple-500"
                            value={item.duration}
                            onChange={e => handlePrescriptionItemChange(index, 'duration', e.target.value)}
                          />
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removePrescriptionItem(index)} 
                        className="p-2 text-red-400 hover:text-red-600 bg-white rounded-full border border-slate-200 ml-2"
                        disabled={prescriptionForm.items.length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button type="button" onClick={() => setShowPrescriptionModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[oklch(0.78_0.03_206.04)] text-white rounded-lg hover:brightness-90 font-medium">
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
