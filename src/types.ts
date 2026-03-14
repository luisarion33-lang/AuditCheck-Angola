export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'accountant' | 'assistant' | 'viewer' | 'super_admin' | 'enterprise' | 'professional' | 'student';
  plan: 'free' | 'student' | 'professional' | 'business';
  is_verified: boolean;
  phone?: string;
  company?: string;
  job_title?: string;
  nif?: string;
  blocked: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  details: string;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  class_id: number;
  parent_id: string | null;
  type: 'debit' | 'credit';
}

export interface JournalItem {
  account_id: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: number;
  date: string;
  description: string;
  items: JournalItem[];
  created_at: string;
}

export interface AuditError {
  type: string;
  explanation: string;
  suggestion: string;
}

export interface Invoice {
  id: number;
  number: string;
  date: string;
  customer_name: string;
  customer_nif: string;
  total_amount: number;
  tax_amount: number;
  status: 'paid' | 'pending';
}
