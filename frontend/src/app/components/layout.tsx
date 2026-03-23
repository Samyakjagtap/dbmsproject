import { Outlet, Navigate } from 'react-router';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Toaster } from 'sonner';
import { authApi } from '../services/api';

export function Layout() {
  // Redirect to login if not authenticated
  if (!authApi.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: 'var(--soft-shadow-md)',
          },
        }}
      />
    </div>
  );
}