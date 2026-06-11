import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bell, Check, CheckCircle2, AlertCircle, Info, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  is_read: boolean;
  created_at: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'WARNING': return <AlertCircle className="text-yellow-500" size={20} />;
      case 'ERROR': return <AlertCircle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200 p-6 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 text-[#6899B0] rounded-lg">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Notifications</h1>
            <p className="text-sm text-black">Your recent updates and alerts</p>
          </div>
        </div>
        
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-black rounded-lg transition-colors text-sm font-medium"
          >
            <Check size={16} />
            <span>Mark all as read</span>
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {loading ? (
            <div className="text-center py-10 text-black">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 text-center">
              <div className="flex justify-center mb-4">
                <Bell size={48} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-black">No notifications</h3>
              <p className="text-black mt-1">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`flex gap-4 p-5 rounded-xl border transition-all ${
                  notification.is_read 
                    ? 'bg-white border-slate-200' 
                    : 'bg-[#E0EEF5]/50 border-blue-100 shadow-sm'
                }`}
              >
                <div className="shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold ${notification.is_read ? 'text-black' : 'text-black'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${notification.is_read ? 'text-black' : 'text-black'}`}>
                    {notification.message}
                  </p>
                  {(notification as any).clinics?.name && (
                    <p className="text-xs text-blue-500 mt-2 font-medium">
                      Clinic: {(notification as any).clinics.name}
                    </p>
                  )}
                </div>
                {!notification.is_read && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-100 text-[#6899B0] transition-colors tooltip-wrapper self-center"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
