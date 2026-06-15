import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import api from '../api/axios';
import { Plus, Trash2, Pill, FileText, Download, MessageCircle, Image as ImageIcon, ClipboardList } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'documents'>('overview');
  
  const [treatmentPlans, setTreatmentPlans] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  
  // Modals / Forms
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentType, setConsentType] = useState('ROOT_CANAL');
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [noteForm, setNoteForm] = useState({
    symptoms: '', diagnosis: '', treatment: '', notes: ''
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    instructions: '',
    items: [{ medicine_name: '', dosage: '', frequency: '', duration: '' }]
  });

  const [planForm, setPlanForm] = useState({
    title: '', total_estimated_cost: 0,
    stages: [{ stage_name: '', description: '', estimated_cost: 0 }]
  });

  const [docForm, setDocForm] = useState({
    title: '', document_type: 'XRAY', description: '', file_url: '' // simplified for demo
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

  const fetchPlans = async () => {
    try {
      const res = await api.get(`/treatments/${id}/plans`);
      setTreatmentPlans(res.data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/treatments/${id}/documents`);
      setDocuments(res.data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
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

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/treatments/plans', { ...planForm, patient_id: id, status: 'PROPOSED' });
      setShowPlanModal(false);
      setPlanForm({ title: '', total_estimated_cost: 0, stages: [{ stage_name: '', description: '', estimated_cost: 0 }] });
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Error adding plan');
    }
  };

  const handleUpdateStage = async (stageId: string, status: string) => {
    try {
      await api.put(`/treatments/plans/stages/${stageId}`, { status, completed_at: status === 'COMPLETED' ? new Date() : null });
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Error updating stage');
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, this would be a multipart/form-data upload to S3/Supabase Storage.
      // Here we just save the metadata and a dummy/placeholder URL or base64.
      const payload = { 
        ...docForm, 
        patient_id: id, 
        file_url: docForm.file_url || 'https://via.placeholder.com/800x600?text=Patient+X-Ray' 
      };
      await api.post('/treatments/documents', payload);
      setShowDocModal(false);
      setDocForm({ title: '', document_type: 'XRAY', description: '', file_url: '' });
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Error adding document');
    }
  };

  if (!patient) return <div className="p-8">Loading patient details...</div>;

  const renderTooth = (num: number, isUpper = true) => {
    const rawStatus = dentalChart.find(t => t.tooth_number === num.toString())?.status || 'HEALTHY';
    const status = rawStatus;
    
    let colorClass = 'text-green-500 drop-shadow-[0_2px_4px_rgba(34,197,94,0.4)]';
    if (status === 'CARIES' || status === 'UNHEALTHY') colorClass = 'text-red-500 drop-shadow-[0_2px_8px_rgba(239,68,68,0.6)]';
    if (status === 'FILLING') colorClass = 'text-blue-500 drop-shadow-[0_2px_8px_rgba(59,130,246,0.6)]';
    if (status === 'CROWN') colorClass = 'text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]';
    if (status === 'ROOT_CANAL') colorClass = 'text-purple-500 drop-shadow-[0_2px_8px_rgba(168,85,247,0.6)]';
    if (status === 'IMPLANT') colorClass = 'text-teal-500 drop-shadow-[0_2px_8px_rgba(20,184,166,0.6)]';
    if (status === 'MISSING') colorClass = 'text-slate-200 opacity-50';
    if (status === 'EXTRACTED') colorClass = 'text-black';

    return (
      <div key={num} className="flex flex-col items-center group cursor-pointer">
         {isUpper && <div className="text-xs font-black text-slate-500 mb-1">{num}</div>}
         <div className="relative transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-1 z-10 hover:z-20">
           <ToothIcon 
             className={`w-8 h-10 ${isUpper ? 'rotate-180' : ''} transition-all ${colorClass}`}
           />
           {isDoctor && (
             <select
               value={status}
               onChange={(e) => handleUpdateTooth(num, e.target.value.toUpperCase())}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               title={`Tooth ${num} - ${status.replace('_', ' ')}`}
             >
               <option value="HEALTHY">Healthy</option>
               <option value="CARIES">Caries</option>
               <option value="FILLING">Filling</option>
               <option value="ROOT_CANAL">Root Canal</option>
               <option value="CROWN">Crown</option>
               <option value="IMPLANT">Implant</option>
               <option value="MISSING">Missing</option>
               <option value="EXTRACTED">Extracted</option>
             </select>
           )}
         </div>
         {!isUpper && <div className="text-xs font-black text-slate-500 mt-1">{num}</div>}
         <div className="text-[9px] mt-1 text-slate-400 font-bold uppercase whitespace-nowrap overflow-hidden text-ellipsis w-12 text-center">
            {status.replace('_', ' ')}
         </div>
      </div>
    );
  };

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

      <div className="flex space-x-4 mb-8 border-b border-slate-200">
        <button onClick={() => setActiveTab('overview')} className={`pb-3 px-4 font-medium transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-b-2 border-[#6899B0] text-[#5D8799]' : 'text-slate-500 hover:text-black'}`}>
          <FileText size={18} /> Overview & Chart
        </button>
        <button onClick={() => setActiveTab('plans')} className={`pb-3 px-4 font-medium transition-colors flex items-center gap-2 ${activeTab === 'plans' ? 'border-b-2 border-[#6899B0] text-[#5D8799]' : 'text-slate-500 hover:text-black'}`}>
          <ClipboardList size={18} /> Treatment Plans
        </button>
        <button onClick={() => setActiveTab('documents')} className={`pb-3 px-4 font-medium transition-colors flex items-center gap-2 ${activeTab === 'documents' ? 'border-b-2 border-[#6899B0] text-[#5D8799]' : 'text-slate-500 hover:text-black'}`}>
          <ImageIcon size={18} /> Imaging & Documents
        </button>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-black">Additional Notes / Description</label>
                <div className="flex gap-2">
                  <span className="text-xs text-slate-500 font-medium">Quick Templates:</span>
                  <button 
                    type="button" 
                    onClick={() => setNoteForm({...noteForm, notes: noteForm.notes + 'Patient presented with pain in the affected region. LA administered. Access opened, canals located and cleaned. Working length established. Canals shaped and irrigated with NaOCl. Master cone radiograph taken. Canals obturated and sealed with temporary restoration. Post-op instructions given. Patient tolerated procedure well.\n'})}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    Root Canal
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNoteForm({...noteForm, notes: noteForm.notes + 'LA administered. Tooth luxated and extracted atraumatically. Socket inspected and irrigated. Hemostasis achieved with pressure pack. Standard post-extraction instructions given to patient. Analgesics prescribed.\n'})}
                    className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded hover:bg-red-100 transition-colors border border-red-200"
                  >
                    Extraction
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNoteForm({...noteForm, notes: noteForm.notes + 'Oral prophylaxis performed using ultrasonic scaler. Plaque and calculus removed from supra and subgingival surfaces. Polishing done. Oral hygiene instructions demonstrated and emphasized.\n'})}
                    className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded hover:bg-green-100 transition-colors border border-green-200"
                  >
                    Cleaning
                  </button>
                </div>
              </div>
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

      {activeTab === 'overview' && (
        <>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-black mb-6">Interactive Dental Chart (FDI Notation)</h2>
        <div className="flex flex-col gap-10">
          {/* Upper Jaw (Maxillary) */}
          <div className="relative">
            <h3 className="text-sm font-bold text-black mb-6 text-center uppercase tracking-widest border-b border-slate-200 pb-2">Upper Jaw</h3>
            <div className="flex justify-center gap-6">
              {/* Top Right (Quadrant 1) */}
              <div className="flex gap-2 border-r-2 border-slate-300 pr-6">
                {[18, 17, 16, 15, 14, 13, 12, 11].map(num => renderTooth(num))}
              </div>
              {/* Top Left (Quadrant 2) */}
              <div className="flex gap-2 pl-6">
                {[21, 22, 23, 24, 25, 26, 27, 28].map(num => renderTooth(num))}
              </div>
            </div>
          </div>
          
          {/* Lower Jaw (Mandibular) */}
          <div className="relative">
            <h3 className="text-sm font-bold text-black mb-6 text-center uppercase tracking-widest border-b border-slate-200 pb-2">Lower Jaw</h3>
            <div className="flex justify-center gap-6">
              {/* Bottom Right (Quadrant 4) */}
              <div className="flex gap-2 border-r-2 border-slate-300 pr-6">
                {[48, 47, 46, 45, 44, 43, 42, 41].map(num => renderTooth(num, false))}
              </div>
              {/* Bottom Left (Quadrant 3) */}
              <div className="flex gap-2 pl-6">
                {[31, 32, 33, 34, 35, 36, 37, 38].map(num => renderTooth(num, false))}
              </div>
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
      </>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Treatment Plans</h2>
            {isDoctor && (
              <button onClick={() => setShowPlanModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-colors font-medium">
                <Plus size={18} /> Create Plan
              </button>
            )}
          </div>
          
          <div className="grid gap-6">
            {treatmentPlans.map(plan => (
              <div key={plan.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-black">{plan.title}</h3>
                    <p className="text-sm text-slate-500">Created: {new Date(plan.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500">Estimated Cost</p>
                    <p className="text-xl font-bold text-[#6899B0]">₹{plan.total_estimated_cost}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-sm text-black uppercase tracking-wider">Stages / Visits</h4>
                  {plan.stages?.map((stage: any, idx: number) => (
                    <div key={stage.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${stage.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-black">{stage.stage_name}</p>
                          <p className="text-xs text-slate-500">{stage.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="font-semibold text-black">₹{stage.estimated_cost}</p>
                        {isDoctor ? (
                          <select 
                            value={stage.status}
                            onChange={(e) => handleUpdateStage(stage.id, e.target.value)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 outline-none cursor-pointer ${stage.status === 'COMPLETED' ? 'border-green-500 text-green-600 bg-green-50' : 'border-slate-300 text-slate-600 bg-white'}`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        ) : (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${stage.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>{stage.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {treatmentPlans.length === 0 && (
              <div className="text-center p-12 bg-white rounded-xl border border-dashed border-slate-300">
                <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No treatment plans created for this patient.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Patient Imaging & Documents</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowConsentModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium">
                <FileText size={18} /> Generate Consent Form
              </button>
              <button onClick={() => setShowDocModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-colors font-medium">
                <Plus size={18} /> Upload Image/Doc
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => (
              <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
                <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {doc.document_type === 'XRAY' || doc.document_type === 'PHOTO' ? (
                    <img src={doc.file_url} alt={doc.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <FileText size={48} className="text-slate-300" />
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                    {doc.document_type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-black mb-1 truncate" title={doc.title}>{doc.title}</h3>
                  <p className="text-xs text-slate-500 mb-2">{new Date(doc.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{doc.description || 'No description provided.'}</p>
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#6899B0] hover:text-[#5D8799]">
                    View Full Size <ImageIcon size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
          {documents.length === 0 && (
            <div className="text-center p-12 bg-white rounded-xl border border-dashed border-slate-300">
              <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No X-Rays or documents uploaded yet.</p>
            </div>
          )}
        </div>
      )}

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

      {/* Add Plan Modal */}
      {showPlanModal && isDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-6 text-[#6899B0]">
              <ClipboardList size={24} />
              <h2 className="text-xl font-bold">Create Treatment Plan</h2>
            </div>

            <form onSubmit={handleAddPlan} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Plan Title</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" placeholder="e.g. Full Mouth Rehabilitation" value={planForm.title} onChange={e => setPlanForm({...planForm, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Estimated Cost (₹)</label>
                <input required type="number" min="0" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={planForm.total_estimated_cost} onChange={e => setPlanForm({...planForm, total_estimated_cost: Number(e.target.value)})} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium">Stages / Visits</label>
                  <button type="button" onClick={() => setPlanForm({...planForm, stages: [...planForm.stages, {stage_name: '', description: '', estimated_cost: 0}]})} className="text-sm text-[#6899B0] font-medium flex items-center gap-1">
                    <Plus size={14} /> Add Stage
                  </button>
                </div>
                
                <div className="space-y-3">
                  {planForm.stages.map((stage, index) => (
                    <div key={index} className="flex gap-2 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex-1 space-y-3">
                        <input required type="text" placeholder="Stage Name (e.g. RCT Visit 1)" className="w-full p-2 border rounded text-sm outline-none" value={stage.stage_name} onChange={e => { const newStages = [...planForm.stages]; newStages[index].stage_name = e.target.value; setPlanForm({...planForm, stages: newStages}); }} />
                        <div className="flex gap-2">
                          <input required type="text" placeholder="Description" className="flex-1 p-2 border rounded text-sm outline-none" value={stage.description} onChange={e => { const newStages = [...planForm.stages]; newStages[index].description = e.target.value; setPlanForm({...planForm, stages: newStages}); }} />
                          <input required type="number" placeholder="Cost" className="w-24 p-2 border rounded text-sm outline-none" value={stage.estimated_cost} onChange={e => { const newStages = [...planForm.stages]; newStages[index].estimated_cost = Number(e.target.value); setPlanForm({...planForm, stages: newStages}); }} />
                        </div>
                      </div>
                      <button type="button" onClick={() => { const newStages = planForm.stages.filter((_, i) => i !== index); setPlanForm({...planForm, stages: newStages}); }} className="p-2 text-red-400 hover:text-red-600" disabled={planForm.stages.length === 1}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button type="button" onClick={() => setShowPlanModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#6899B0] text-white rounded-lg hover:brightness-90 font-medium">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-6 text-[#6899B0]">
              <ImageIcon size={24} />
              <h2 className="text-xl font-bold">Upload Imaging / Document</h2>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" className="w-full p-2 border rounded outline-none" placeholder="e.g. Pre-op OPG" value={docForm.title} onChange={e => setDocForm({...docForm, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full p-2 border rounded outline-none" value={docForm.document_type} onChange={e => setDocForm({...docForm, document_type: e.target.value})}>
                  <option value="XRAY">X-Ray (OPG, IOPA, CBCT)</option>
                  <option value="PHOTO">Clinical Photo</option>
                  <option value="CONSENT">Consent Form</option>
                  <option value="OTHER">Other Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea className="w-full p-2 border rounded outline-none" placeholder="Notes about this file..." value={docForm.description} onChange={e => setDocForm({...docForm, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File URL (Demo)</label>
                <input type="text" className="w-full p-2 border rounded outline-none text-sm" placeholder="Leave empty for dummy image, or paste URL" value={docForm.file_url} onChange={e => setDocForm({...docForm, file_url: e.target.value})} />
                <p className="text-xs text-slate-500 mt-1">* In a real app, this would be a file upload input.</p>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#6899B0] text-white rounded-lg hover:brightness-90">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Consent Form Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <FileText size={24} className="text-[#6899B0]" /> Generate Consent Form
              </h2>
              <button onClick={() => setShowConsentModal(false)} className="text-slate-400 hover:text-black">
                ✕
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Procedure</label>
              <div className="flex gap-2">
                {['ROOT_CANAL', 'EXTRACTION', 'IMPLANT', 'GENERAL'].map(type => (
                  <button
                    key={type}
                    onClick={() => setConsentType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${consentType === type ? 'bg-[#6899B0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-8 overflow-y-auto print:border-none print:p-0 print:bg-white" id="consent-form-print">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-black">Q DENT CLINIC</h1>
                <p className="text-slate-500">Informed Consent for {consentType.replace('_', ' ')} Procedure</p>
              </div>

              <div className="mb-6 text-sm text-black space-y-2">
                <p><strong>Patient Name:</strong> {patient.first_name} {patient.last_name}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>

              <div className="text-sm text-black leading-relaxed space-y-4 mb-12">
                <p>I hereby authorize Dr. ____________________ and their staff to perform the {consentType.replace('_', ' ')} procedure.</p>
                <p>I have been informed of the nature of the procedure, alternative options, and the risks associated with this treatment. I understand that dentistry is not an exact science and that no guarantees have been made to me regarding the outcome.</p>
                {consentType === 'ROOT_CANAL' && (
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Possible failure of root canal therapy requiring retreatment or extraction.</li>
                    <li>Possible instrument fracture within the canal.</li>
                    <li>Need for a permanent restoration (crown) after completion.</li>
                  </ul>
                )}
                {consentType === 'EXTRACTION' && (
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Risk of bleeding, swelling, or dry socket.</li>
                    <li>Possible damage to adjacent teeth or nerves (numbness).</li>
                    <li>Bone fragments may be retained.</li>
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-2 gap-12 mt-12 pt-12 border-t border-slate-200">
                <div>
                  <div className="border-b border-black h-8 mb-2"></div>
                  <p className="text-sm font-bold text-center">Patient Signature</p>
                </div>
                <div>
                  <div className="border-b border-black h-8 mb-2"></div>
                  <p className="text-sm font-bold text-center">Doctor Signature</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 print:hidden">
              <button type="button" onClick={() => setShowConsentModal(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
              <button 
                type="button" 
                onClick={() => {
                  const printContents = document.getElementById('consent-form-print')?.innerHTML;
                  const originalContents = document.body.innerHTML;
                  if (printContents) {
                    document.body.innerHTML = printContents;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload(); // Quick reset for React state after innerHTML swap
                  }
                }}
                className="px-5 py-2 bg-[#6899B0] text-white font-bold rounded-lg hover:bg-[#5D8799]"
              >
                Print Consent Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
