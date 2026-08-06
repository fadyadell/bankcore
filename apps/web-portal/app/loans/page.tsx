'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import styles from './loans.module.css';

interface Loan {
  id: string;
  customerId: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('PERSONAL');
  const [customerId, setCustomerId] = useState('');

  const fetchLoans = async () => {
    try {
      const response = await apiClient.get('/loans/applications');
      setLoans(response.data);
    } catch (err) {
      console.error('Error fetching loans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/loans/applications', {
        customerId,
        amount: parseFloat(amount),
        type,
      });
      // Refresh list
      fetchLoans();
      // Reset form
      setAmount('');
      setCustomerId('');
    } catch (err) {
      console.error('Failed to apply for loan', err);
      alert('Failed to apply for loan');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Loan Applications Dashboard</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.card}>
          <h2>Apply for a Loan</h2>
          <form onSubmit={handleApply} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Customer ID (UUID)</label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Loan Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="PERSONAL">Personal</option>
                <option value="MORTGAGE">Mortgage</option>
                <option value="AUTO">Auto</option>
              </select>
            </div>
            <button type="submit" className={styles.button}>Submit Application</button>
          </form>
        </section>

        <section className={styles.card}>
          <h2>Existing Loan Applications</h2>
          {loading ? (
            <p>Loading...</p>
          ) : loans.length === 0 ? (
            <p>No loan applications found.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan.id}>
                    <td>{loan.id.substring(0, 8)}...</td>
                    <td>{loan.customerId.substring(0, 8)}...</td>
                    <td>{loan.type}</td>
                    <td>${loan.amount.toLocaleString()}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[loan.status.toLowerCase()] || ''}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
