import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  notes: string;
  type: 'income' | 'expense';
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  getBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  refreshTransactions: () => void;
  importTransactions: (importedTransactions: Transaction[]) => void;
  exportTransactions: () => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const STORAGE_KEY = 'expense_tracker_transactions';

// Initial mock data
const initialTransactions: Transaction[] = [
  { 
    id: '1', 
    title: 'Grocery Shopping', 
    amount: 2500, 
    category: 'Food & Dining', 
    date: '2026-03-20', 
    type: 'expense',
    paymentMethod: 'UPI',
    notes: ''
  },
  { 
    id: '2', 
    title: 'Monthly Salary', 
    amount: 50000, 
    category: 'Salary', 
    date: '2026-03-19', 
    type: 'income',
    paymentMethod: 'Net Banking',
    notes: ''
  },
  { 
    id: '3', 
    title: 'Coffee Shop', 
    amount: 350, 
    category: 'Food & Dining', 
    date: '2026-03-18', 
    type: 'expense',
    paymentMethod: 'Cash',
    notes: ''
  },
  { 
    id: '4', 
    title: 'Fuel', 
    amount: 1200, 
    category: 'Transport', 
    date: '2026-03-17', 
    type: 'expense',
    paymentMethod: 'Credit Card',
    notes: ''
  },
  { 
    id: '5', 
    title: 'Rent Payment', 
    amount: 15000, 
    category: 'Bills & Utilities', 
    date: '2026-03-15', 
    type: 'expense',
    paymentMethod: 'Net Banking',
    notes: ''
  },
  { 
    id: '6', 
    title: 'Freelance Project', 
    amount: 25000, 
    category: 'Freelance', 
    date: '2026-03-10', 
    type: 'income',
    paymentMethod: 'UPI',
    notes: 'Website design project'
  },
  { 
    id: '7', 
    title: 'Online Shopping', 
    amount: 4500, 
    category: 'Shopping', 
    date: '2026-03-12', 
    type: 'expense',
    paymentMethod: 'Credit Card',
    notes: ''
  },
  { 
    id: '8', 
    title: 'Investment Returns', 
    amount: 10000, 
    category: 'Investments', 
    date: '2026-03-08', 
    type: 'income',
    paymentMethod: 'Net Banking',
    notes: 'Mutual fund dividend'
  },
];

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return initialTransactions;
      }
    }
    return initialTransactions;
  });

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
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

  const refreshTransactions = useCallback(() => {
    // Force re-read from localStorage and update state
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTransactions([...parsed]);
      } catch {
        // Keep current state if parse fails
      }
    }
  }, []);

  const importTransactions = useCallback((importedTransactions: Transaction[]) => {
    setTransactions(prev => {
      // Merge imported transactions, avoiding duplicates by ID
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
