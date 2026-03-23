import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useTransactions } from '../contexts/transaction-context';

export function NotificationBanner() {
  const { getBalance, getTotalExpense, getTotalIncome } = useTransactions();
  const [showBanner, setShowBanner] = useState(true);

  const balance = getBalance();
  const threshold = 50000;
  const showLowBalance = balance < threshold && balance > 0;

  // Check if expenses are higher than income this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const totalExpense = getTotalExpense();
  const totalIncome = getTotalIncome();
  const showHighSpending = totalExpense > totalIncome * 0.8;

  if (!showBanner) return null;

  // Determine which notification to show
  let notification = null;

  if (showLowBalance) {
    notification = {
      type: 'warning',
      title: 'Low Balance Alert',
      message: `Your balance is below ₹50,000. Current balance: ₹${balance.toLocaleString('en-IN')}. Consider reducing expenses or adding income.`,
      icon: AlertTriangle,
    };
  } else if (showHighSpending) {
    notification = {
      type: 'info',
      title: 'High Spending Alert',
      message: `Your expenses are ${((totalExpense / totalIncome) * 100).toFixed(0)}% of your income. Current expenses: ₹${totalExpense.toLocaleString('en-IN')}. Consider reviewing your budget.`,
      icon: TrendingDown,
    };
  }

  if (!notification) return null;

  const Icon = notification.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6 p-4 rounded-xl bg-gradient-to-r from-warning/10 to-destructive/10 border-2 border-warning/30 shadow-[var(--soft-shadow-sm)]"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-warning shadow-[var(--soft-shadow-sm)] flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              {notification.title}
              <TrendingDown className="w-4 h-4 text-warning" />
            </h3>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}