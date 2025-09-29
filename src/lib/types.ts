export type Account = {
    accountId: string;
    name: string;
    type: string;
    subtype?: string | null;
    mask?: string | null;
    balance: number;
    institution: string;
};

export interface Transaction {
    id: string;        // Plaid transaction_id
    name: string;      // Transaction name (e.g., "Coffee Shop")
    amount: number;    // Positive numbers are debits
    date: string;      // YYYY-MM-DD
    category: string | null;  // First category or null if not provided
  }