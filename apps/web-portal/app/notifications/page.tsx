'use client';
import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  subject: string;
  body: string;
  sentAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seeded customer user ID
    const customerId = '11111111-1111-1111-1111-111111111112';
    fetch(`http://localhost:3006/notifications/user/${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items) {
          setNotifications(data.items);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 font-body-md h-full min-h-screen flex">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col bg-white border-r border-slate-200 h-screen w-64 pt-6 pb-8 px-4 gap-4">
        <div className="mb-8 px-2">
          <h2 className="text-xl font-bold text-blue-600">BankCore</h2>
          <p className="text-sm text-slate-500">Customer Portal</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          <a
            className="flex items-center gap-4 px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">account_balance</span>
            <span className="text-sm font-medium">Accounts</span>
          </a>
          <a
            className="flex items-center gap-4 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              notifications
            </span>
            <span className="text-sm">Notifications ({notifications.length})</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-10 px-8">
        <div className="max-w-[1000px] mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Your Notifications</h1>

          {loading ? (
            <div className="text-slate-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                notifications_off
              </span>
              <p className="text-slate-500">You have no new notifications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-slate-900">{notif.subject}</h3>
                      <span className="text-xs text-slate-400">
                        {new Date(notif.sentAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-2">{notif.body}</p>
                    <div className="mt-3">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded uppercase tracking-wider font-semibold">
                        {notif.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
