'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { apiClient } from '../../../../lib/apiClient';

interface Task {
  id: string;
  name: string;
  createTime: string;
  taskDefinitionKey?: string;
  variables?: {
    transactionId?: string;
    amount?: number;
    description?: string;
    type?: string;
  };
}

export default function EmployeeTransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = () => {
    setLoading(true);
    apiClient.get('/tasks')
      .then(res => {
        const data = res.data.data || res.data || [];
        const taskArray = Array.isArray(data) ? data : [];
        const employeeTxTasks = taskArray.filter((t: Task) => t.taskDefinitionKey === 'employeeReview' && t.variables?.transactionId);
        setTasks(employeeTxTasks);
      })
      .catch(err => console.error("Failed to fetch tasks", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleReview = async (taskId: string, approved: boolean) => {
    try {
      await apiClient.post(`/tasks/${taskId}/complete`, {
        decision: approved ? 'APPROVED' : 'REJECTED',
        reason: approved ? 'Approved by employee' : 'Rejected by employee'
      });
      fetchTasks();
    } catch (err: any) {
      console.error("Failed to complete task", err);
      alert("Failed to review transaction. Please try again.");
    }
  };

  return (
    <div className="animate-fade-in pb-10 max-w-6xl mx-auto">
      <div className="mb-8 glass-card p-6 border-none shadow-sm bg-white/40">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display gradient-text">Transaction Review Queue</h1>
        <p className="mt-1.5 text-sm text-slate-500 font-medium">Review and approve or reject pending transactions.</p>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
          <CardTitle className="text-lg font-bold">Pending Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider px-6">Date</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">Description</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">Type</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">Amount</TableHead>
                <TableHead className="text-right font-bold text-slate-600 uppercase text-xs tracking-wider px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({length: 4}).map((_, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24 skeleton-shimmer" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40 skeleton-shimmer" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 skeleton-shimmer" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 skeleton-shimmer" /></TableCell>
                    <TableCell className="px-6 py-4 text-right"><Skeleton className="ml-auto h-8 w-32 rounded-md skeleton-shimmer" /></TableCell>
                  </TableRow>
                ))
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-slate-500">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-4">
                      <span className="material-symbols-outlined text-3xl text-emerald-500">check_circle</span>
                    </div>
                    <p className="font-semibold text-slate-600">No pending transactions to review.</p>
                    <p className="text-sm mt-1">Queue is empty. Great job!</p>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-blue-50/30 transition-colors cursor-default">
                    <TableCell className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(task.createTime).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="py-4 font-medium text-slate-900">
                      {task.variables?.description || `Transaction ${task.variables?.transactionId || task.id}`}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50">{task.variables?.type || 'TRANSFER'}</Badge>
                    </TableCell>
                    <TableCell className={`py-4 font-mono-data font-bold text-base ${(task.variables?.amount || 0) > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {Number(task.variables?.amount || 0).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 opacity-80 hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold px-4"
                          onClick={() => handleReview(task.id, false)}
                        >
                          Reject
                        </Button>
                        <Button 
                          variant="primary"
                          size="sm"
                          className="font-bold shadow-md shadow-blue-500/20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          onClick={() => handleReview(task.id, true)}
                        >
                          Approve
                        </Button>
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
