'use client';

import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '@/lib/apiClient';
import type { NotificationDto } from '@bankcore/contracts';

export default function EmployeeNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    let active = true;
    getNotifications().then(res => {
      if (!active) return;
      if (res.data) setNotifications(res.data.items);
      else setError(res.error?.message || 'Failed to load notifications');
      setLoading(false);
    });
    return () => { active = false; };
  };

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    load();
  };

  if (loading && notifications.length === 0) return <div className="loading-page"><div className="loading-spinner" /><p>Loading notifications...</p></div>;

  return (
    <div className="fade-in">
      <header className="page-header">
        <div>
          <h1>My Notifications</h1>
          <p className="text-secondary">System alerts and customer requests</p>
        </div>
      </header>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      <div className="card">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <p>You have no notifications.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map(notif => (
              <div key={notif.id} className={`p-4 rounded-lg border ${notif.status === 'UNREAD' ? 'border-accent-blue bg-accent-blue/5' : 'border-border-color bg-bg-card'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{notif.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-secondary">{new Date(notif.createdAt).toLocaleString()}</span>
                    {notif.status === 'UNREAD' && (
                      <button className="btn btn-ghost btn-sm text-xs" onClick={() => handleMarkRead(notif.id)}>Mark Read</button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-secondary">{notif.message}</p>
                <div className="mt-2 flex gap-2">
                  <span className="badge badge-sm">{notif.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
