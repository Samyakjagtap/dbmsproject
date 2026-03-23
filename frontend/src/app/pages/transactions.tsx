import { useState } from 'react';
import { SoftCard } from '../components/soft-card';
import { SoftInput } from '../components/soft-input';
import { SoftButton } from '../components/soft-button';
import { Search, Filter, Edit2, Trash2, ShoppingBag, Coffee, Car, Home, TrendingUp, Utensils, Heart, DollarSign, Briefcase, PiggyBank, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTransactions, Transaction } from '../contexts/transaction-context';
import { toast } from 'sonner';

export function Transactions() {
  const { transactions, deleteTransaction, updateTransaction } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Get icon for transaction
  const getTransactionIcon = (category: string, type: string) => {
    if (type === 'income') {
      if (category === 'Salary') return Briefcase;
      if (category === 'Freelance') return DollarSign;
      if (category === 'Investments') return PiggyBank;
      return TrendingUp;
    }
    
    if (category.includes('Food')) return category.includes('Dining') ? Utensils : Coffee;
    if (category.includes('Shopping')) return ShoppingBag;
    if (category.includes('Transport')) return Car;
    if (category.includes('Bills') || category.includes('Rent')) return Home;
    if (category.includes('Healthcare')) return Heart;
    return ShoppingBag;
  };

  // Add icons to transactions
  const transactionsWithIcons = transactions.map(t => ({
    ...t,
    icon: getTransactionIcon(t.category, t.type),
  }));

  const filteredTransactions = transactionsWithIcons.filter((transaction) => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditTitle(transaction.title);
    setEditAmount(transaction.amount.toString());
    setEditCategory(transaction.category);
    setEditDate(transaction.date);
    setEditPaymentMethod(transaction.paymentMethod);
    setEditNotes(transaction.notes);
  };

  const handleSaveEdit = () => {
    if (!editingTransaction) return;

    updateTransaction(editingTransaction.id, {
      title: editTitle,
      amount: parseFloat(editAmount),
      category: editCategory,
      date: editDate,
      paymentMethod: editPaymentMethod,
      notes: editNotes,
    });

    toast.success('Transaction updated successfully!', {
      description: `${editTitle} has been updated`,
      duration: 3000,
    });

    setEditingTransaction(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Transactions</h1>
        <p className="text-muted-foreground">View and manage all your transactions</p>
      </div>

      {/* Filters */}
      <SoftCard className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <SoftInput
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="rounded-xl px-4 py-3 bg-input-background border-2 border-transparent shadow-[var(--soft-shadow-inset)] focus:border-primary focus:outline-none transition-all duration-200"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl px-4 py-3 bg-input-background border-2 border-transparent shadow-[var(--soft-shadow-inset)] focus:border-primary focus:outline-none transition-all duration-200"
            >
              <option value="all">All Categories</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transport">Transport</option>
              <option value="Bills & Utilities">Bills & Utilities</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Income">Income</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Showing {filteredTransactions.length} transactions</p>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-lg font-semibold text-success">
                ₹{filteredTransactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expense</p>
              <p className="text-lg font-semibold text-destructive">
                ₹{Math.abs(filteredTransactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0))
                  .toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </SoftCard>

      {/* Transactions List */}
      <SoftCard>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No transactions found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-background shadow-[var(--soft-shadow-sm)] hover:shadow-[var(--soft-shadow-md)] transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl ${
                      transaction.type === 'income' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    } shadow-[var(--soft-shadow-sm)] flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{transaction.title}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-success' : 'text-foreground'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditClick(transaction)}
                        className="w-9 h-9 rounded-lg bg-info/10 text-info hover:bg-info/20 flex items-center justify-center transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(transaction.id)}
                        className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </SoftCard>

      {/* Edit Transaction Modal */}
      <AnimatePresence>
        {editingTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-[var(--soft-shadow-lg)] p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Edit Transaction</h2>
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <SoftInput
                  label="Title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Transaction title"
                />

                <SoftInput
                  label="Amount (₹)"
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="0.00"
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="rounded-xl px-4 py-3 bg-input-background border-2 border-transparent shadow-[var(--soft-shadow-inset)] focus:border-primary focus:outline-none transition-all duration-200"
                  >
                    <option value="">Select Category</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Bills & Utilities">Bills & Utilities</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Education">Education</option>
                    <option value="Travel">Travel</option>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investments">Investments</option>
                  </select>
                </div>

                <SoftInput
                  label="Date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Payment Method</label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    className="rounded-xl px-4 py-3 bg-input-background border-2 border-transparent shadow-[var(--soft-shadow-inset)] focus:border-primary focus:outline-none transition-all duration-200"
                  >
                    <option value="">Select Payment Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Wallet">Wallet</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add any notes..."
                    rows={3}
                    className="rounded-xl px-4 py-3 bg-input-background border-2 border-transparent shadow-[var(--soft-shadow-inset)] focus:border-primary focus:outline-none transition-all duration-200 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <SoftButton
                    variant="primary"
                    onClick={handleSaveEdit}
                    className="flex-1"
                  >
                    Save Changes
                  </SoftButton>
                  <SoftButton
                    variant="ghost"
                    onClick={() => setEditingTransaction(null)}
                  >
                    Cancel
                  </SoftButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}