'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { apiClient } from '../../../../lib/apiClient';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  kycStatus?: string;
  status: string;
  roles: string[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/users/${session.user.id}`);
      setProfile(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session?.user?.id]);

  const verifyKyc = async () => {
    if (!profile?.id) return;
    try {
      await apiClient.put(`/users/${profile.id}`, { kycStatus: 'VERIFIED' });
      fetchProfile();
      alert('KYC verification successful!');
    } catch (err) {
      console.error('Failed to verify KYC', err);
      alert('Failed to update KYC status.');
    }
  };

  if (!session?.user) {
    return (
      <div className="animate-fade-in p-10 max-w-4xl mx-auto text-center">
        <Skeleton className="h-10 w-48 mx-auto mb-4 skeleton-shimmer" />
        <Skeleton className="h-32 w-full skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10 max-w-4xl mx-auto">
      <div className="mb-8 glass-card p-6 border-none shadow-sm bg-white/40">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display gradient-text">My Profile</h1>
        <p className="mt-1.5 text-sm text-slate-500 font-medium">Manage your personal information and security settings.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="glass-card text-center overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <CardContent className="pt-0 relative">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full border-4 border-white bg-white shadow-sm">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-4xl font-bold text-indigo-700 shadow-inner">
                  {profile?.firstName?.charAt(0) || session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="pt-16 pb-4">
                {loading ? (
                  <>
                    <Skeleton className="h-6 w-32 mx-auto mb-2 skeleton-shimmer" />
                    <Skeleton className="h-4 w-48 mx-auto mb-4 skeleton-shimmer" />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-slate-900">{profile?.firstName} {profile?.lastName}</h2>
                    <p className="text-sm text-slate-500">{profile?.email}</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {(profile?.roles || []).map(role => (
                        <Badge key={role} variant="outline" className="bg-slate-50 border-slate-200 uppercase text-[10px]">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500 text-[18px]">verified_user</span>
                Identity Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <Skeleton className="h-8 w-full skeleton-shimmer" />
              ) : profile?.kycStatus === 'VERIFIED' ? (
                <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                  <span className="font-semibold text-sm">Identity Verified</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                    <span className="material-symbols-outlined text-amber-500 shrink-0">warning</span>
                    <span className="text-xs font-medium">Your identity is not verified. Some features may be restricted.</span>
                  </div>
                  <Button variant="primary" className="w-full font-bold shadow-md shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={verifyKyc}>
                    Verify Identity Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-6">
                  <Skeleton className="h-10 w-full skeleton-shimmer" />
                  <Skeleton className="h-10 w-full skeleton-shimmer" />
                </div>
              ) : (
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">First Name</label>
                      <input 
                        type="text" 
                        value={profile?.firstName || ''}
                        disabled
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Last Name</label>
                      <input 
                        type="text" 
                        value={profile?.lastName || ''}
                        disabled
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input 
                      type="email" 
                      value={profile?.email || ''}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  
                  <p className="text-xs text-slate-400 font-medium">To change your personal details, please contact customer support or visit a branch.</p>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-bold">Security</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white/50">
                <div>
                  <h4 className="font-bold text-slate-900">Password</h4>
                  <p className="text-sm text-slate-500 mt-1">Manage your account password.</p>
                </div>
                <Button variant="outline" className="text-slate-600 font-semibold hover:bg-slate-50">Change Password</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white/50">
                <div>
                  <h4 className="font-bold text-slate-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-500 mt-1">Add an extra layer of security.</p>
                </div>
                <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-500">Not Configured</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
