import { SoftCard } from '../components/soft-card';
import { NotificationBanner } from '../components/notification-banner';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  DollarSign,
  Briefcase,
  PiggyBank
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { useTransactions } from '../contexts/transaction-context';
import { useMemo } from 'react';

export function Dashboard() {
  const { transactions, getBalance, getTotalIncome, getTotalExpense } = useTransactions();

  // Calculate totals
  const totalBalance = getBalance();
  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset hours for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return new Date(dateString).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  };

  // Calculate previous month's data for trend
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const previousMonthIncome = useMemo(() => {
    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'income' && 
               tDate.getMonth() === currentMonth - 1 && 
               tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonth, currentYear]);

  const previousMonthExpense = useMemo(() => {
    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && 
               tDate.getMonth() === currentMonth - 1 && 
               tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonth, currentYear]);

  // Calculate trends
  const incomeTrend = previousMonthIncome > 0 
    ? ((totalIncome - previousMonthIncome) / previousMonthIncome * 100).toFixed(1)
    : '0.0';
  const expenseTrend = previousMonthExpense > 0
    ? ((totalExpense - previousMonthExpense) / previousMonthExpense * 100).toFixed(1)
    : '0.0';

  const balanceData = [
    { title: 'Total Balance', amount: totalBalance, icon: Wallet, color: 'from-blue-500 to-purple-500', trend: `${parseFloat(incomeTrend) - parseFloat(expenseTrend) > 0 ? '+' : ''}${(parseFloat(incomeTrend) - parseFloat(expenseTrend)).toFixed(1)}%` },
    { title: 'Total Income', amount: totalIncome, icon: TrendingUp, color: 'from-green-500 to-emerald-500', trend: `${parseFloat(incomeTrend) > 0 ? '+' : ''}${incomeTrend}%` },
    { title: 'Total Expenses', amount: totalExpense, icon: TrendingDown, color: 'from-red-500 to-pink-500', trend: `${parseFloat(expenseTrend) > 0 ? '+' : ''}${expenseTrend}%` },
  ];

  // Generate monthly chart data (last 6 months)
  const expenseData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthIncome = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'income' && tDate.getMonth() === month && tDate.getFullYear() === year;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthExpense = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'expense' && tDate.getMonth() === month && tDate.getFullYear() === year;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        name: months[month],
        income: monthIncome,
        expense: monthExpense,
      });
    }
    
    return data;
  }, [transactions]);

  // Generate category pie chart data
  const categoryData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (categoryTotals[t.category]) {
          categoryTotals[t.category] += t.amount;
        } else {
          categoryTotals[t.category] = t.amount;
        }
      });
    
    const colors = ['#667eea', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];
    
    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  }, [transactions]);

  // Get icon for transaction
  const getTransactionIcon = (category: string, type: string) => {
    if (type === 'income') {
      if (category === 'Salary') return Briefcase;
      if (category === 'Freelance') return DollarSign;
      if (category === 'Investments') return PiggyBank;
      return TrendingUp;
    }
    
    if (category.includes('Food')) return Coffee;
    if (category.includes('Shopping')) return ShoppingBag;
    if (category.includes('Transport')) return Car;
    if (category.includes('Bills') || category.includes('Rent')) return Home;
    return ShoppingBag;
  };

  // Get recent transactions (last 5) - sorted by date descending
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        // Sort by date descending (newest first)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(t => ({
        ...t,
        icon: getTransactionIcon(t.category, t.type),
      }));
  }, [transactions]);

  return (
    <div className="space-y-8">
      {/* Notification Banner */}
      <NotificationBanner />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {balanceData.map((item, index) => {
          const Icon = item.icon;
          return (
            <SoftCard key={index} hover className="relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{item.title}</p>
                  <h3 className="text-3xl font-bold text-foreground">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} shadow-[var(--soft-shadow-sm)] flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.trend.startsWith('+') ? (
                  <ArrowUpRight className="w-4 h-4 text-success" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-destructive" />
                )}
                <span className={`text-sm font-medium ${item.trend.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                  {item.trend}
                </span>
                <span className="text-sm text-muted-foreground">vs last month</span>
              </div>
            </SoftCard>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <SoftCard>
          <h3 className="text-xl font-semibold text-foreground mb-6">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--soft-shadow-md)'
                }} 
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </SoftCard>

        {/* Pie Chart */}
        <SoftCard>
          <h3 className="text-xl font-semibold text-foreground mb-6">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--soft-shadow-md)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </SoftCard>
      </div>

      {/* Recent Transactions */}
      <SoftCard>
        <h3 className="text-xl font-semibold text-foreground mb-6">Recent Transactions</h3>
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions yet. Add your first transaction to get started!</p>
            </div>
          ) : (
            recentTransactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <motion.div
                  key={transaction.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-background shadow-[var(--soft-shadow-sm)] hover:shadow-[var(--soft-shadow-md)] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${
                      transaction.type === 'income' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    } shadow-[var(--soft-shadow-sm)] flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.title}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-foreground'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </SoftCard>
    </div>
  );
}