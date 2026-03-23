import { Outlet } from 'react-router';
import { Wallet } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-[var(--soft-shadow-md)] flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">ExpenseTracker</h1>
          <p className="text-muted-foreground">Manage your expenses with ease</p>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
