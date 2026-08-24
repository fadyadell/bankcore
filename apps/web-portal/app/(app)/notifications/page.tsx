'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../../lib/apiClient';
import { useSocket } from '../../../providers/SocketProvider';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { connected } = useSocket();

  const fetchNotifications = () => {
    setLoading(true);
    apiClient.get('/notifications?limit=50')
      .then(res => {
        setNotifications(res.data.data || res.data || []);
      })
      .catch(err => console.error("Failed to fetch notifications", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, [connected]); // refetch if socket reconnects

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'TRANSACTION_APPROVED':
      case 'LOAN_APPROVED':
        return { icon: 'check_circle', color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'TRANSACTION_REJECTED':
      case 'LOAN_REJECTED':
        return { icon: 'cancel', color: 'text-red-500', bg: 'bg-red-50' };
      case 'ALERT':
        return { icon: 'warning', color: 'text-amber-500', bg: 'bg-amber-50' };
      default:
        return { icon: 'notifications', color: 'text-blue-500', bg: 'bg-blue-50' };
    }
  };

  return (
    <div className="animate-fade-in pb-10 max-w-4xl mx-auto">
      <div className="mb-8 glass-card p-6 border-none shadow-sm bg-white/40 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display gradient-text">Notifications</h1>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">Stay updated with your account activity.</p>
        </div>
        <Button variant="outline" className="text-slate-600 font-bold" onClick={fetchNotifications}>
          <span className="material-symbols-outlined text-sm mr-2">refresh</span>
          Refresh
        </Button>
      </div>

      <Card className="glass-card border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {loading ? (
              Array.from({length: 4}).map((_, i) => (
                <div key={i} className="p-6 flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full skeleton-shimmer" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48 skeleton-shimmer" />
                    <Skeleton className="h-4 w-full max-w-md skeleton-shimmer" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                  <span className="material-symbols-outlined text-3xl text-slate-400">notifications_off</span>
                </div>
                <p className="font-semibold text-slate-600">You're all caught up!</p>
                <p className="text-sm mt-1">No new notifications at the moment.</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const style = getIconForType(notification.type);
                return (
                  <div 
                    key={notification.id} 
                    className={`p-6 flex items-start gap-5 transition-colors ${notification.isRead ? 'bg-transparent' : 'bg-blue-50/40'}`}
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                      <span className={`material-symbols-outlined ${style.color}`}>{style.icon}</span>
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className={`text-base font-bold ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                          {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${notification.isRead ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                        {notification.message}
                      </p>
                    </div>
                    
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-3 py-1 rounded-full shadow-sm hover:shadow transition-all"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
