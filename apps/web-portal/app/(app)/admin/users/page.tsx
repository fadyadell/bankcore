'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { apiClient } from '../../../../../lib/apiClient';

interface User {
  id: string;
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  roles: string[];
  createdAt: string;
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = () => {
    setLoading(true);
    apiClient.get('/users?limit=50')
      .then(res => {
        setUsers(res.data.data || res.data || []);
      })
      .catch(err => console.error("Failed to fetch users", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromote = async (userId: string, currentRoles: string[]) => {
    try {
      const newRoles = [...currentRoles, 'employee'];
      // Assuming iam-service supports updating roles, though we might need keycloak integration for this.
      // For now, let's just use the update API if it supports roles, or mock it.
      await apiClient.put(`/users/${userId}`, { roles: newRoles });
      fetchUsers();
    } catch (err: any) {
      console.error("Failed to promote user", err);
      alert("Failed to promote user. Ensure the IAM service supports role updates.");
    }
  };

  return (
    <div className="animate-fade-in pb-10 max-w-6xl mx-auto">
      <div className="mb-8 glass-card p-6 border-none shadow-sm bg-white/40">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display gradient-text">User Directory</h1>
        <p className="mt-1.5 text-sm text-slate-500 font-medium">Manage users, view details, and assign roles.</p>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
          <CardTitle className="text-lg font-bold">System Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider px-6">User</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">Roles</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">Joined</TableHead>
                <TableHead className="text-right font-bold text-slate-600 uppercase text-xs tracking-wider px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({length: 4}).map((_, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-40 skeleton-shimmer" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 skeleton-shimmer" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 skeleton-shimmer" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 skeleton-shimmer" /></TableCell>
                    <TableCell className="px-6 py-4 text-right"><Skeleton className="ml-auto h-8 w-32 rounded-md skeleton-shimmer" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-slate-500">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                      <span className="material-symbols-outlined text-3xl text-slate-400">group_off</span>
                    </div>
                    <p className="font-semibold text-slate-600">No users found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-blue-50/30 transition-colors cursor-default">
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className={user.status === 'ACTIVE' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-slate-200 text-slate-600'}>
                        {user.status || 'ACTIVE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex gap-1 flex-wrap">
                        {(user.roles || ['customer']).map(role => (
                          <span key={role} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {role}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-slate-500 text-sm font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 opacity-80 hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-bold px-3"
                        >
                          Details
                        </Button>
                        {!(user.roles || []).includes('employee') && !(user.roles || []).includes('admin') && (
                          <Button 
                            variant="primary"
                            size="sm"
                            className="font-bold shadow-md shadow-violet-500/20 px-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                            onClick={() => handlePromote(user.id, user.roles || [])}
                          >
                            Promote
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
