import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './contexts/theme-context';
import { TransactionProvider } from './contexts/transaction-context';
import { ProfileProvider } from './contexts/profile-context';

function App() {
  return (
    <ThemeProvider>
      <TransactionProvider>
        <ProfileProvider>
          <RouterProvider router={router} />
        </ProfileProvider>
      </TransactionProvider>
    </ThemeProvider>
  );
}

export default App;