// src/app/pages/dashboard.tsx
// ─────────────────────────────────────────────────────────────
//  Replace your existing dashboard.tsx with this file.
//  Reads live balance + recent transactions from MySQL.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { userApi, DashboardData } from '../services/api';
import LowBalanceAlert from '../components/LowBalanceAlert';

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

export default function Dashboard() {
  const [data, setData]     = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading dashboard…</div>;
  if (!data)   return <div className="p-8 text-center text-red-400">Failed to load data.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Low-balance alert popup */}
      {data.lowBalanceAlert && (
        <LowBalanceAlert balance={data.balance} limit={data.balance_limit} currency="₹" />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-indigo-50 p-5">
          <p className="text-sm text-indigo-400 font-medium">Balance</p>
          <p className={`text-2xl font-bold mt-1 ${data.balance < data.balance_limit ? 'text-red-500' : 'text-indigo-700'}`}>
            {fmt(data.balance)}
          </p>
          {data.lowBalanceAlert && (
            <p className="text-xs text-red-400 mt-1">⚠️ Below limit ({fmt(data.balance_limit)})</p>
          )}
        </div>
        <div className="rounded-2xl bg-green-50 p-5">
          <p className="text-sm text-green-400 font-medium">Total Income</p>
          <p className="text-2xl font-bold mt-1 text-green-700">{fmt(data.total_income)}</p>
        </div>
        <div className="rounded-2xl bg-red-50 p-5">
          <p className="text-sm text-red-400 font-medium">Total Expenses</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{fmt(data.total_expenses)}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-lg font-bold mb-3">Recent Transactions</h2>
        {data.recent_transactions.length === 0 ? (
          <p className="text-gray-400 text-sm">No transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.recent_transactions.map(tx => (
              <li key={tx.id} className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ background: tx.category_color || '#6366f1' }}
                  >
                    {(tx.category_name || 'N')[0]}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{tx.description || tx.category_name || '—'}</p>
                    <p className="text-xs text-gray-400">{tx.date}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(Number(tx.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Category breakdown */}
      {data.category_breakdown.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3">Spending by Category</h2>
          <ul className="space-y-2">
            {data.category_breakdown.map(c => (
              <li key={c.name} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                <span className="flex-1 text-sm">{c.name}</span>
                <span className="text-sm font-semibold">{fmt(Number(c.total))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
