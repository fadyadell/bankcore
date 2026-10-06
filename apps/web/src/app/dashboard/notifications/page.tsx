'use client';

import { useEffect, useState } from 'react';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/lib/apiClient';
import type { NotificationDto } from '@bankcore/contracts';

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    getMyNotifications().then(res => {
      if (res.data) setNotifications(res.data);
      else setError(res.error?.message || 'Failed to load notifications');
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) return <div className="loading-page"><div className="loading-spinner" /><p>Loading notifications...</p></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const unreadCount = notifications.filter(n => n.status !== 'READ').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications {unreadCount > 0 && <span className="badge badge-red">{unreadCount} unread</span>}</h1>
          <p>Stay updated on your account activity and alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost" onClick={handleMarkAllRead}>Mark all as read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state"><p>No notifications</p><span>You&#39;re all caught up!</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map(notif => (
            <div key={notif.id} className="card" style={{ padding: '1rem', borderLeft: notif.status === 'READ' ? '' : '3px solid var(--accent-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {notif.status !== 'READ' && <span className="notification-dot" />}
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: notif.status === 'READ' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    {notif.title}
                  </h3>
                  <span className="badge badge-gray">{notif.type}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {notif.message}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {notif.status !== 'READ' && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleMarkRead(notif.id)}>Mark as read</button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(notif.id)} style={{ color: 'var(--accent-red)' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
