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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transaction Review Queue</h1>
        <p className="text-slate-500">Review and approve or reject pending transactions.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle>Pending Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 4}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-32 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined mx-auto mb-2 text-3xl text-slate-400">check_circle</span>
                    <p>No pending transactions to review.</p>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="text-slate-500">
                      {new Date(task.createTime).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {task.variables?.description || `Transaction ${task.variables?.transactionId || task.id}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{task.variables?.type || 'TRANSFER'}</Badge>
                    </TableCell>
                    <TableCell className={`font-medium ${(task.variables?.amount || 0) > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {Number(task.variables?.amount || 0).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleReview(task.id, false)}
                        >
                          Reject
                        </Button>
                        <Button 
                          variant="primary"
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
