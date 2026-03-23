import { useState } from 'react';
import { SoftCard } from '../components/soft-card';
import { SoftInput } from '../components/soft-input';
import { SoftButton } from '../components/soft-button';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useTransactions } from '../contexts/transaction-context';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const expenseCategories = [
  'Food & Dining',
  'Shopping',
  'Transport',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Others',
];

const incomeCategories = [
  'Freelance',
  'Salary',
  'Investments',
  'Other',
];

const paymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Wallet',
];

export function AddTransaction() {
  const { addTransaction, getBalance } = useTransactions();
  const navigate = useNavigate();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  // Get categories based on transaction type
  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    const currentBalance = getBalance();

    // Add transaction to context
    addTransaction({
      title,
      amount: parsedAmount,
      category,
      date,
      paymentMethod,
      notes,
      type,
    });

    // Show success notification with custom styling
    if (type === 'income') {
      toast.success('Income Added Successfully! 🎉', {
        description: `₹${parsedAmount.toLocaleString('en-IN')} added to ${category}`,
        duration: 5000,
      });
    } else {
      toast.success('Expense Added Successfully!', {
        description: `₹${parsedAmount.toLocaleString('en-IN')} spent on ${category}`,
        duration: 4000,
      });

      // Check for large expense
      if (parsedAmount > 5000) {
        setTimeout(() => {
          toast.warning('Large Expense Alert! 💸', {
            description: `You spent ₹${parsedAmount.toLocaleString('en-IN')} on ${category}`,
            duration: 3000,
          });
        }, 100);
      }

      // Check for low balance
      const newBalance = currentBalance - parsedAmount;
      if (newBalance < 5000 && newBalance > 0) {
        setTimeout(() => {
          toast.warning('Low Balance Alert! 🚨', {
            description: `Your balance is now ₹${newBalance.toLocaleString('en-IN')}`,
            duration: 3000,
          });
        }, 200);
      }
    }

    // Reset form
    setTitle('');
    setAmount('');
    setCategory('');
    setDate('');
    setPaymentMethod('');
    setNotes('');

    // Navigate to dashboard (correct path)
    navigate('/app');
  };

  // Reset category when type changes
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(''); // Reset category when switching type
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Add Transaction</h1>
        <p className="text-muted-foreground">Record your income or expense</p>
      </div>

      <SoftCard>
        {/* Transaction Type Toggle */}
        <div className="flex gap-4 mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              type === 'expense'
                ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-[var(--soft-shadow-md)]'
                : 'bg-background text-foreground shadow-[var(--soft-shadow-sm)]'
            }`}
          >
            <ArrowDownCircle className="w-5 h-5" />
            Expense
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTypeChange('income')}
            className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              type === 'income'
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-[var(--soft-shadow-md)]'
                : 'bg-background text-foreground shadow-[var(--soft-shadow-sm)]'
            }`}
          >
            <ArrowUpCircle className="w-5 h-5" />
            Income
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SoftInput
              label="Title"
              type="text"
              placeholder="e.g., Grocery Shopping"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <SoftInput
              label="Amount (₹)"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl px-4 py-3 bg-input-background border-2 border-transparent shadow-[var(--soft-shadow-inset)] focus:border-primary focus:outline-none transition-all duration-200"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <SoftInput
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="rounded-xl px-4 py-3 bg-input-background border-2 border-transparent shadow-[var(--soft-shadow-inset)] focus:border-primary focus:outline-none transition-all duration-200"
                required
              >
                <option value="">Select Payment Method</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={4}
              className="rounded-xl px-4 py-3 bg-input-background border-2 border-transparent shadow-[var(--soft-shadow-inset)] focus:border-primary focus:outline-none transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex gap-4">
            <SoftButton
              type="submit"
              variant="success"
              icon={Plus}
              className="flex-1"
            >
              Add Transaction
            </SoftButton>
            <SoftButton
              type="button"
              variant="ghost"
              onClick={() => {
                setTitle('');
                setAmount('');
                setCategory('');
                setDate('');
                setPaymentMethod('');
                setNotes('');
              }}
              className="px-8"
            >
              Cancel
            </SoftButton>
          </div>
        </form>
      </SoftCard>
    </div>
  );
}