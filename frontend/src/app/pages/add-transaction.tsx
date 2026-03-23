import { useState, useEffect } from 'react';
import { SoftCard } from '../components/soft-card';
import { SoftInput } from '../components/soft-input';
import { SoftButton } from '../components/soft-button';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useTransactions } from '../contexts/transaction-context';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { categoriesApi, Category } from '../services/api';

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
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(cat => cat.type === type);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const parsedAmount = parseFloat(amount);
    const currentBalance = getBalance();
    const selectedCategory = filteredCategories.find(c => c.id === categoryId);

    try {
      await addTransaction({
        title,
        amount: parsedAmount,
        category: selectedCategory?.name || 'Other',
        category_id: categoryId || undefined,
        date,
        paymentMethod,
        notes,
        type,
      });

      if (type === 'income') {
        toast.success('Income Added Successfully!', {
          description: `₹${parsedAmount.toLocaleString('en-IN')} added to ${selectedCategory?.name || 'income'}`,
          duration: 5000,
        });
      } else {
        toast.success('Expense Added Successfully!', {
          description: `₹${parsedAmount.toLocaleString('en-IN')} spent on ${selectedCategory?.name || 'expense'}`,
          duration: 4000,
        });

        if (parsedAmount > 5000) {
          setTimeout(() => {
            toast.warning('Large Expense Alert!', {
              description: `You spent ₹${parsedAmount.toLocaleString('en-IN')} on ${selectedCategory?.name || 'expense'}`,
              duration: 3000,
            });
          }, 100);
        }

        const newBalance = currentBalance - parsedAmount;
        if (newBalance < 5000 && newBalance > 0) {
          setTimeout(() => {
            toast.warning('Low Balance Alert!', {
              description: `Your balance is now ₹${newBalance.toLocaleString('en-IN')}`,
              duration: 3000,
            });
          }, 200);
        }
      }

      setTitle('');
      setAmount('');
      setCategoryId('');
      setDate('');
      setPaymentMethod('');
      setNotes('');

      navigate('/app');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategoryId('');
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
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                className="rounded-xl px-4 py-3 bg-input-background border-2 border-transparent shadow-[var(--soft-shadow-inset)] focus:border-primary focus:outline-none transition-all duration-200"
                required
              >
                <option value="">Select Category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
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
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Transaction'}
            </SoftButton>
            <SoftButton
              type="button"
              variant="ghost"
              onClick={() => {
                setTitle('');
                setAmount('');
                setCategoryId('');
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
