// src/app/services/api.ts
// ─────────────────────────────────────────────────────────────
//  Central API service — all backend calls go through here.
//  Drop this file into your Figma Make project at:
//    src/app/services/api.ts
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('et_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, balance_limit = 1000) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, balance_limit }),
    }),
};

// ── Transactions ──────────────────────────────────────────────
export const transactionsApi = {
  getAll: () => request<Transaction[]>('/transactions'),

  add: (tx: NewTransaction) =>
    request<{ id: number; balance: number; lowBalanceAlert: boolean; balance_limit: number }>(
      '/transactions',
      { method: 'POST', body: JSON.stringify(tx) }
    ),

  update: (id: number, tx: Partial<NewTransaction>) =>
    request<{ message: string }>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tx),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/transactions/${id}`, { method: 'DELETE' }),
};

// ── Categories ────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => request<Category[]>('/categories'),

  add: (cat: { name: string; icon?: string; color?: string }) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(cat) }),

  delete: (id: number) =>
    request<{ message: string }>(`/categories/${id}`, { method: 'DELETE' }),
};

// ── User / Balance ────────────────────────────────────────────
export const userApi = {
  getProfile: () => request<User>('/user/profile'),

  updateProfile: (data: Partial<User>) =>
    request<{ message: string }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getBalance: () => request<BalanceInfo>('/user/balance'),

  getDashboard: () => request<DashboardData>('/user/dashboard'),
};

// ── Types ─────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  balance_limit: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number | null;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface NewTransaction {
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: string;
  category_id?: number | null;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface BalanceInfo {
  balance: number;
  total_income: number;
  total_expenses: number;
  balance_limit: number;
  lowBalanceAlert: boolean;
}

export interface DashboardData extends BalanceInfo {
  recent_transactions: Transaction[];
  category_breakdown: { name: string; color: string; total: number }[];
}
