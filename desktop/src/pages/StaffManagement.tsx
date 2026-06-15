import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { UserPlus, Trash2, CheckCircle, XCircle, Calendar, Plus } from 'lucide-react';

interface Profile {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  avatar_url?: string;
}

interface Staff {
  id: string;
  profile_id: string;
  employee_id: string;
  designation: string;
  salary: number;
  profiles: Profile;
}

const StaffManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'leaves' | 'schedule'>('overview');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  
  // Data states
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Tab-specific modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    email: '', password: '', role: 'DOCTOR', firstName: '', lastName: '', employeeId: '', designation: '', mobile: '', salary: 0, avatarUrl: ''
  });

  const [leaveFormData, setLeaveFormData] = useState({
    staff_id: '', start_date: '', end_date: '', reason: '', type: 'SICK'
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    staff_id: '', day_of_week: 'MONDAY', start_time: '09:00', end_time: '17:00'
  });

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaffList(res.data.staff || res.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/staff/attendance');
      setAttendance(res.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/staff/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/staff/schedule');
      setSchedules(res.data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStaff(), fetchAttendance(), fetchLeaves(), fetchSchedules()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff', formData);
      setShowModal(false);
      setFormData({
        email: '', password: '', role: 'DOCTOR', firstName: '', lastName: '', employeeId: '', designation: '', mobile: '', salary: 0, avatarUrl: ''
      });
      fetchStaff();
    } catch (err) {
      console.error('Error creating staff:', err);
      alert('Error creating staff member');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.delete(`/staff/${id}`);
        fetchStaff();
      } catch (err) {
        console.error('Error deleting staff:', err);
      }
    }
  };

  const handleMarkAttendance = async (staffId: string, status: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await api.post('/staff/attendance', { staffId: staffId, date: today, status });
      fetchAttendance();
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('Failed to mark attendance');
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff/leaves', {
        staffId: leaveFormData.staff_id,
        startDate: leaveFormData.start_date,
        endDate: leaveFormData.end_date,
        reason: leaveFormData.reason,
        type: leaveFormData.type
      });
      setShowLeaveModal(false);
      setLeaveFormData({ staff_id: '', start_date: '', end_date: '', reason: '', type: 'SICK' });
      fetchLeaves();
    } catch (err) {
      console.error('Error applying for leave:', err);
      alert('Failed to apply leave');
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff/schedule', scheduleFormData);
      setShowScheduleModal(false);
      fetchSchedules();
    } catch (err) {
      console.error('Error updating schedule:', err);
      alert('Failed to update schedule');
    }
  };

  const handleLeaveStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/staff/leaves/${id}`, { status });
      fetchLeaves();
    } catch (err) {
      console.error('Error updating leave status:', err);
    }
  };

  const renderTabs = () => (
    <div className="flex space-x-6 mb-8 border-b border-slate-200">
      {['overview', 'attendance', 'leaves', 'schedule'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab as any)}
          className={`pb-3 font-semibold capitalize transition-colors ${
            activeTab === tab
              ? 'border-b-2 border-[#6899B0] text-[#6899B0]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderOverview = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Staff List</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#6899B0] text-white font-semibold rounded-lg hover:bg-[#5D8799] transition-all shadow-sm"
        >
          <UserPlus size={18} />
          Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">Employee ID</th>
              <th className="p-4 font-bold">Name</th>
              <th className="p-4 font-bold">Role</th>
              <th className="p-4 font-bold">Email</th>
              <th className="p-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map((staff) => (
              <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-semibold text-slate-900">{staff.employee_id}</td>
                <td className="p-4 flex items-center gap-3 font-medium text-slate-700">
                  {staff.profiles?.avatar_url ? (
                    <img src={staff.profiles.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#6899B0]/10 flex items-center justify-center text-[#6899B0] font-bold text-xs shadow-sm border border-[#6899B0]/20">
                      {staff.profiles?.first_name?.[0]}{staff.profiles?.last_name?.[0]}
                    </div>
                  )}
                  {staff.profiles?.first_name} {staff.profiles?.last_name}
                </td>
                <td className="p-4">
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider rounded-md">
                    {staff.profiles?.role}
                  </span>
                </td>
                <td className="p-4 text-slate-600">{staff.profiles?.email}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleDeleteStaff(staff.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {staffList.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-500">No staff found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderAttendance = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-black">Daily Attendance</h2>
          <p className="text-sm text-black">Mark attendance for today: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-black text-sm">
            <th className="p-4">Staff Name</th>
            <th className="p-4">Role</th>
            <th className="p-4">Today's Status</th>
            <th className="p-4">Mark Attendance</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((staff) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const todayRecord = attendance.find(a => a.staff_id === staff.id && a.date === todayStr);
            return (
              <tr key={staff.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="p-4 font-medium text-black">{staff.profiles?.first_name} {staff.profiles?.last_name}</td>
                <td className="p-4 text-black text-sm">{staff.profiles?.role}</td>
                <td className="p-4">
                  {todayRecord ? (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      todayRecord.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                      todayRecord.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {todayRecord.status}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-sm">Not marked</span>
                  )}
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleMarkAttendance(staff.id, 'PRESENT')} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs rounded hover:bg-green-100 font-medium">
                    <CheckCircle size={14} /> Present
                  </button>
                  <button onClick={() => handleMarkAttendance(staff.id, 'ABSENT')} className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 text-xs rounded hover:bg-red-100 font-medium">
                    <XCircle size={14} /> Absent
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderLeaves = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Leave Requests</h2>
        <button
          onClick={() => setShowLeaveModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799]"
        >
          <Plus size={18} />
          Apply Leave
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-black text-sm">
              <th className="p-4">Staff</th>
              <th className="p-4">Type</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="p-4 font-medium text-black">{leave.staff?.profiles?.first_name} {leave.staff?.profiles?.last_name}</td>
                <td className="p-4 text-black">{leave.type}</td>
                <td className="p-4 text-black text-sm">
                  {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                </td>
                <td className="p-4 text-black text-sm max-w-xs truncate">{leave.reason}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {leave.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  {leave.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleLeaveStatusUpdate(leave.id, 'APPROVED')} className="text-green-600 hover:text-green-800 font-medium text-xs">Approve</button>
                      <button onClick={() => handleLeaveStatusUpdate(leave.id, 'REJECTED')} className="text-red-600 hover:text-red-800 font-medium text-xs">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {leaves.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-black">No leave requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderSchedule = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Doctor Schedules</h2>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799]"
        >
          <Calendar size={18} />
          Update Schedule
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
          const daySchedules = schedules.filter(s => s.day_of_week === day);
          if (daySchedules.length === 0) return null;
          return (
            <div key={day} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-3 border-b border-slate-200 font-semibold text-black">{day}</div>
              <div className="divide-y divide-slate-100 p-2">
                {daySchedules.map(s => (
                  <div key={s.id} className="p-2 flex justify-between items-center">
                    <span className="font-medium text-black text-sm">
                      {s.staff?.profiles?.first_name} {s.staff?.profiles?.last_name}
                    </span>
                    <span className="text-black text-xs bg-slate-100 px-2 py-1 rounded">
                      {s.start_time.substring(0,5)} - {s.end_time.substring(0,5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Staff & HR</h1>
        <p className="text-slate-500 text-sm mt-1">Manage employees, track attendance, and oversee schedules.</p>
      </div>
      
      {renderTabs()}

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6899B0]"></div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'attendance' && renderAttendance()}
          {activeTab === 'leaves' && renderLeaves()}
          {activeTab === 'schedule' && renderSchedule()}
        </>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Add New Staff</h2>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input required className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input required className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input required type="email" className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input required type="password" placeholder="At least 6 chars" className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee ID</label>
                  <input required className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Avatar URL (Optional)</label>
                  <input type="url" placeholder="https://example.com/avatar.jpg" className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={formData.avatarUrl} onChange={e => setFormData({...formData, avatarUrl: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="DOCTOR">Doctor</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="ASSISTANT">Assistant</option>
                    <option value="CLINIC_ADMIN">Clinic Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799]">Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Staff Member</label>
                <select required className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={leaveFormData.staff_id} onChange={e => setLeaveFormData({...leaveFormData, staff_id: e.target.value})}>
                  <option value="">Select Staff...</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.profiles?.first_name} {s.profiles?.last_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input required type="date" className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={leaveFormData.start_date} onChange={e => setLeaveFormData({...leaveFormData, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input required type="date" className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={leaveFormData.end_date} onChange={e => setLeaveFormData({...leaveFormData, end_date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Leave Type</label>
                <select className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={leaveFormData.type} onChange={e => setLeaveFormData({...leaveFormData, type: e.target.value})}>
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="VACATION">Vacation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea required className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={leaveFormData.reason} onChange={e => setLeaveFormData({...leaveFormData, reason: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowLeaveModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799]">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Update Schedule</h2>
            <form onSubmit={handleUpdateSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Staff Member</label>
                <select required className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={scheduleFormData.staff_id} onChange={e => setScheduleFormData({...scheduleFormData, staff_id: e.target.value})}>
                  <option value="">Select Staff...</option>
                  {staffList.filter(s => s.profiles?.role === 'DOCTOR').map(s => <option key={s.id} value={s.id}>Dr. {s.profiles?.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Day of Week</label>
                <select className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={scheduleFormData.day_of_week} onChange={e => setScheduleFormData({...scheduleFormData, day_of_week: e.target.value})}>
                  {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input required type="time" className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={scheduleFormData.start_time} onChange={e => setScheduleFormData({...scheduleFormData, start_time: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input required type="time" className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={scheduleFormData.end_time} onChange={e => setScheduleFormData({...scheduleFormData, end_time: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799]">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffManagement;
