// Re-export shared types from the client package
// These include UI component props, form data types, etc.

// Re-export core domain types that the client needs
export interface Category {
  id: number;
  name: string;
  color?: string | null;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}

export interface Transaction {
  id: number;
  plaidTransactionId: string;
  name: string;
  amount: number; // Client expects number for formatting
  date: string;
  categories: Category[];
  merchantName?: string | null;
  isoCurrencyCode?: string | null; // Client expects this name
  pending: boolean;
}

export interface PaginatedTransactions {
  data: Transaction[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Example client-specific types
export interface ClientConfig {
  apiBaseUrl: string;
  plaidEnv: "sandbox" | "development" | "production";
}
