import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { BookOpen, Bell, LogOut, User as UserIcon, Shield, Check, CheckCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getMemberNotifications(user._id || user.id);
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-200">Admin</span>;
      case 'librarian':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">Librarian</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Member ({user?.memberType || 'Student'})</span>;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-brand-600 p-2 rounded-xl text-white shadow-md shadow-brand-500/20">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 tracking-tight text-lg leading-none">Digital Library</h1>
          <span className="text-xs text-slate-500">University Management System</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications dropdown for logged in user */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-rose-100 text-rose-700 font-medium rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-3.5 text-xs transition-colors flex items-start justify-between gap-3 ${
                          !n.isRead ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className={`text-slate-800 ${!n.isRead ? 'font-semibold' : ''}`}>{n.message}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.sentAt).toLocaleString()}
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkRead(n._id)}
                            className="p-1 text-slate-400 hover:text-brand-600 rounded"
                            title="Mark read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Info & Role */}
        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-slate-800 text-sm">{user.name}</div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                {getRoleBadge(user.role)}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
