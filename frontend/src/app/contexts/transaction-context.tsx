import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  category_id?: number;
  date: string;
  paymentMethod: string;
  notes: string;
  type: 'income' | 'expense';
}

interface BackendTransaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  date: string;
  category_id: number | null;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
}

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  getBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  refreshTransactions: () => Promise<void>;
  importTransactions: (importedTransactions: Transaction[]) => void;
  exportTransactions: () => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const API_BASE = 'http://localhost:5000/api';

function getToken(): string | null {
  return localStorage.getItem('et_token');
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data as T;
}

function mapBackendToFrontend(tx: BackendTransaction): Transaction {
  return {
    id: tx.id.toString(),
    title: tx.description || 'Transaction',
    amount: Number(tx.amount),
    category: tx.category_name || 'Other',
    category_id: tx.category_id ?? undefined,
    date: tx.date.split('T')[0],
    paymentMethod: 'Other',
    notes: '',
    type: tx.type,
  };
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!authApi.isAuthenticated()) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest<BackendTransaction[]>('/transactions');
      setTransactions(data.map(mapBackendToFrontend));
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const payload = {
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.title,
        date: transaction.date,
        category_id: transaction.category_id || null,
      };

      await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await fetchTransactions();
    } catch (err) {
      console.error('Failed to add transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await apiRequest(`/transactions/${id}`, {
        method: 'DELETE',
      });
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const existing = transactions.find(t => t.id === id);
      if (!existing) return;

      const payload = {
        type: updates.type ?? existing.type,
        amount: updates.amount ?? existing.amount,
        description: updates.title ?? existing.title,
        date: updates.date ?? existing.date,
        category_id: updates.category_id ?? existing.category_id ?? null,
      };

      await apiRequest(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      await fetchTransactions();
    } catch (err) {
      console.error('Failed to update transaction:', err);
      throw err;
    }
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpense = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpense();
  };

  const refreshTransactions = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  const importTransactions = useCallback((importedTransactions: Transaction[]) => {
    setTransactions(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newTransactions = importedTransactions.filter(t => !existingIds.has(t.id));
      return [...prev, ...newTransactions];
    });
  }, []);

  const exportTransactions = useCallback(() => {
    return [...transactions];
  }, [transactions]);

  const value: TransactionContextType = {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getBalance,
    getTotalIncome,
    getTotalExpense,
    refreshTransactions,
    importTransactions,
    exportTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
