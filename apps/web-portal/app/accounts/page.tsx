'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import styles from './accounts.module.css';

interface Account {
  id: string;
  customerId: string;
  type: string;
  balance: number;
  currency: string;
  status: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState('CHECKING');
  const [currency, setCurrency] = useState('USD');

  const fetchAccounts = async () => {
    try {
      // Assuming accounts are retrieved via /accounts
      const response = await apiClient.get('/accounts');
      setAccounts(response.data);
    } catch (err) {
      console.error('Error fetching accounts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/accounts', {
        customerId,
        type,
        currency,
        initialBalance: 0,
      });
      fetchAccounts();
      setCustomerId('');
    } catch (err) {
      console.error('Failed to create account', err);
      alert('Failed to create account');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Accounts Dashboard</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.card}>
          <h2>Open New Account</h2>
          <form onSubmit={handleCreateAccount} className={styles.form}>
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
              <label>Account Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <button type="submit" className={styles.button}>Open Account</button>
          </form>
        </section>

        <section className={styles.card}>
          <h2>Existing Accounts</h2>
          {loading ? (
            <p>Loading...</p>
          ) : accounts.length === 0 ? (
            <p>No accounts found.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>Customer ID</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Currency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.id}>
                    <td>{acc.id.substring(0, 8)}...</td>
                    <td>{acc.customerId.substring(0, 8)}...</td>
                    <td>{acc.type}</td>
                    <td className={styles.balance}>{acc.balance.toLocaleString()}</td>
                    <td>{acc.currency}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[acc.status.toLowerCase()] || ''}`}>
                        {acc.status}
                      </span>
                    </td>
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
