interface TransactionResponse {
  id: string;
  itemId: string;
  accountId: string;
  date: string; // ISO date string
  amount: number;
  name: string;
  category: string[];
  pending: boolean;
  type: string; // e.g., "debit", "credit"
  isoCurrencyCode?: string; // Optional, if available
  accountName?: string; // Optional, if available
  accountMask?: string; // Optional, if available
  accountType?: string; // Optional, if available
  accountSubtype?: string; // Optional, if available
  location?: {
    city?: string; // Optional, if available
    state?: string; // Optional, if available
    country?: string; // Optional, if available
    lat?: number; // Optional, if available
    long?: number; // Optional, if available
  };
}

export interface getTransactionsResponse {
  transactions: TransactionResponse[];
}
export interface getTransactionsRequest {
  itemId: string;
  accountIds: string[];
  startDate: string;
  endDate: string;
}
