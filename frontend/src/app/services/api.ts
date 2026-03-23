const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken(): string | null {
  return localStorage.getItem('et_token');
}

function setToken(token: string): void {
  localStorage.setItem('et_token', token);
}

function removeToken(): void {
  localStorage.removeItem('et_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  register: async (name: string, email: string, password: string, balance_limit = 1000) => {
    const data = await request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, balance_limit }),
    });
    setToken(data.token);
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  logout: () => {
    removeToken();
  },

  isAuthenticated: () => {
    return !!getToken();
  },
};

// Transactions API
export const transactionsApi = {
  getAll: () => request<Transaction[]>('/transactions'),

  add: (transaction: Omit<Transaction, 'id'>) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),

  update: (id: string, transaction: Partial<Transaction>) =>
    request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    }),

  export: () => request<{ transactions: Transaction[] }>('/transactions/export'),

  import: (transactions: Transaction[]) =>
    request<{ message: string; count: number }>('/transactions/import', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    }),
};

// Categories API
export const categoriesApi = {
  getAll: () => request<Category[]>('/categories'),

  add: (category: Omit<Category, 'id'>) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// User API
export const userApi = {
  getProfile: () => request<User>('/user/profile'),

  updateProfile: (data: Partial<User>) =>
    request<{ message: string }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch(`${BASE_URL}/user/avatar`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  getBalance: () => request<BalanceData>('/user/balance'),

  getDashboard: () => request<DashboardData>('/user/dashboard'),
};

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  balance_limit?: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  category_id?: number;
  date: string;
  paymentMethod: string;
  notes: string;
  type: 'income' | 'expense';
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface BalanceData {
  balance: number;
  total_income: number;
  total_expenses: number;
  balance_limit: number;
  lowBalanceAlert: boolean;
}

export interface DashboardData extends BalanceData {
  recent_transactions: Transaction[];
  category_breakdown: { name: string; color: string; total: number }[];
}
