// src/app/pages/add-transaction.tsx
// ─────────────────────────────────────────────────────────────
//  Replace your existing add-transaction.tsx with this file.
//  It saves transactions to MySQL via the backend API and
//  triggers the low-balance alert popup on submit.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { transactionsApi, categoriesApi, Category } from '../services/api';
import LowBalanceAlert from '../components/LowBalanceAlert';

export default function AddTransaction() {
  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  // Low-balance state
  const [balance, setBalance]         = useState<number | null>(null);
  const [balanceLimit, setBalanceLimit] = useState<number>(1000);
  const [showAlert, setShowAlert]     = useState(false);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.date) { setError('Amount and date are required'); return; }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await transactionsApi.add({
        type:        form.type,
        amount:      parseFloat(form.amount),
        description: form.description || undefined,
        date:        form.date,
        category_id: form.category_id ? parseInt(form.category_id) : null,
      });

      setBalance(res.balance);
      setBalanceLimit(res.balance_limit);
      if (res.lowBalanceAlert) setShowAlert(true);

      setSuccess('Transaction added successfully!');
      setForm({ type: 'expense', amount: '', description: '', date: new Date().toISOString().split('T')[0], category_id: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Low-balance popup */}
      {showAlert && balance !== null && (
        <LowBalanceAlert
          balance={balance}
          limit={balanceLimit}
          currency="₹"
        />
      )}

      <h1 className="text-2xl font-bold mb-6">Add Transaction</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex gap-2">
          {(['expense', 'income'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm(f => ({ ...f, type: t }))}
              className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
                form.type === t
                  ? t === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Amount */}
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount (₹)"
          value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
          required
        />

        {/* Description */}
        <input
          type="text"
          placeholder="Description (optional)"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />

        {/* Date */}
        <input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
          required
        />

        {/* Category */}
        <select
          value={form.category_id}
          onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">Select category (optional)</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
}
