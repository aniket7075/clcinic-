import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setClinicName, setClinicId } from '../store/authSlice';
import { Building, ChevronDown, Check } from 'lucide-react';
import api from '../api/axios';

interface Clinic {
  id: string;
  name: string;
}

const ClinicSwitcher: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [activeClinic, setActiveClinic] = useState<Clinic | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Only SUPER_ADMIN can switch clinics freely right now
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (isSuperAdmin) {
      const fetchClinics = async () => {
        try {
          const response = await api.get('/settings/clinics');
          setClinics(response.data);
          if (response.data.length > 0) {
            // Use the persisted clinic if it exists, otherwise default
            const savedStateStr = localStorage.getItem('authState');
            let savedClinicId = null;
            if (savedStateStr) {
              try {
                savedClinicId = JSON.parse(savedStateStr).clinicId;
              } catch (e) {}
            }
            
            const defaultClinic = savedClinicId 
              ? response.data.find((c: Clinic) => c.id === savedClinicId) 
              : (response.data.find((c: Clinic) => c.name === 'Main Clinic') || response.data[0]);
              
            if (defaultClinic) {
              setActiveClinic(defaultClinic);
              dispatch(setClinicName(defaultClinic.name));
              dispatch(setClinicId(defaultClinic.id));
              api.defaults.headers.common['x-clinic-id'] = defaultClinic.id;
            }
          }
        } catch (error) {
          console.error('Failed to fetch clinics:', error);
        }
      };
      fetchClinics();
    } else {
      // For non-admin, just show their active clinic name
      const fetchMyClinic = async () => {
        try {
          const response = await api.get('/settings/clinic');
          setActiveClinic(response.data);
          dispatch(setClinicName(response.data.name));
          dispatch(setClinicId(response.data.id));
          // Their own token implies clinic_id, so x-clinic-id is not strictly needed
        } catch (error) {
          console.error('Failed to fetch clinic:', error);
        }
      };
      fetchMyClinic();
    }
  }, [isSuperAdmin]);

  const handleSelect = (clinic: Clinic) => {
    setActiveClinic(clinic);
    dispatch(setClinicName(clinic.name));
    dispatch(setClinicId(clinic.id));
    api.defaults.headers.common['x-clinic-id'] = clinic.id;
    setIsOpen(false);
    // Reload to apply new clinic context globally to all components
    window.location.reload(); 
  };

  if (!activeClinic) return null;

  return (
    <div className="relative mb-6 z-50">
      <button
        onClick={() => isSuperAdmin && setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold transition-all shadow-lg shadow-black/5 ${
          isSuperAdmin ? 'hover:bg-white/20 cursor-pointer hover:shadow-xl' : 'cursor-default'
        }`}
      >
        <div className="flex items-center space-x-3 truncate">
          <div className="p-2 bg-white text-[#6899B0] rounded-lg shrink-0 shadow-sm">
            <Building size={18} strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-[15px] tracking-wide truncate">{activeClinic.name}</span>
        </div>
        {isSuperAdmin && <ChevronDown size={18} strokeWidth={2.5} className={`text-white/80 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && isSuperAdmin && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#4C7182] rounded-2xl shadow-2xl shadow-black/20 border border-white/10 z-50 overflow-hidden backdrop-blur-xl">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {clinics.map((clinic) => (
              <button
                key={clinic.id}
                onClick={() => handleSelect(clinic)}
                className="flex items-center justify-between w-full p-3.5 text-[14px] text-[#E0EEF5] hover:bg-white/10 hover:text-white transition-colors text-left "
              >
                <span className="truncate pr-2">{clinic.name}</span>
                {activeClinic.id === clinic.id && <Check size={18} strokeWidth={3} className="text-white shrink-0 drop-shadow-md" />}
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-white/10 bg-white/5">
            <button className="w-full py-2.5 text-xs font-bold text-[#E0EEF5] hover:text-white hover:bg-white/10 rounded-xl transition-colors uppercase tracking-widest">
              + Manage Clinics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicSwitcher;
