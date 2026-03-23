import { Bell, Moon, Sun, X, Check } from 'lucide-react';
import { useTheme } from '../contexts/theme-context';
import { useProfile } from '../contexts/profile-context';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router';
import { useState } from 'react';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/app': { title: 'Welcome Back!', subtitle: 'Track your expenses and manage your budget' },
  '/app/add': { title: 'Add Transaction', subtitle: 'Record your income or expense' },
  '/app/transactions': { title: 'Transactions', subtitle: 'View and manage all transactions' },
  '/app/categories': { title: 'Categories', subtitle: 'Organize your expense categories' },
  '/app/profile': { title: 'Profile Settings', subtitle: 'Manage your account preferences' },
};

const sampleNotifications = [
  { id: 1, title: 'Low Balance Alert', message: 'Your balance is below ₹5000', time: '5 minutes ago', read: false },
  { id: 2, title: 'Large Expense', message: 'You spent ₹8500 on Shopping', time: '2 hours ago', read: false },
  { id: 3, title: 'Monthly Report Ready', message: 'Your expense report for March is ready', time: '1 day ago', read: true },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { profileImage, userName } = useProfile();
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || pageTitles['/app'];
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const hasUnreadNotifications = notifications.some(notif => !notif.read);

  // Get user initials for avatar
  const getInitials = () => {
    if (!userName || userName.trim() === '') return '?';
    return userName
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-20 bg-card shadow-[var(--soft-shadow-sm)] flex items-center justify-between px-4 lg:px-8">
      <div className="ml-16 lg:ml-0">
        <h2 className="text-xl lg:text-2xl font-semibold text-foreground">{pageInfo.title}</h2>
        <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">{pageInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-background shadow-[var(--soft-shadow-sm)] flex items-center justify-center hover:shadow-[var(--soft-shadow-md)] transition-all"
          >
            <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-foreground" />
            {hasUnreadNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-80 bg-card rounded-xl shadow-[var(--soft-shadow-lg)] z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 border-b border-border hover:bg-background transition-colors cursor-pointer last:border-b-0 ${
                          !notif.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notif.read ? 'bg-muted' : 'bg-primary'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-border text-center">
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-background shadow-[var(--soft-shadow-sm)] flex items-center justify-center hover:shadow-[var(--soft-shadow-md)] transition-all"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 lg:w-5 lg:h-5 text-foreground" />
          ) : (
            <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-foreground" />
          )}
        </motion.button>

        {/* User Avatar */}
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl shadow-[var(--soft-shadow-sm)] object-cover"
          />
        ) : (
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-[var(--soft-shadow-sm)] flex items-center justify-center text-white text-sm lg:text-base font-semibold">
            {getInitials()}
          </div>
        )}
      </div>
    </header>
  );
}