export interface User {
    first_name: ReactNode;
    last_name: ReactNode;
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export interface Transaction {
  transaction_id: number;
  customer_id: number;
  business_id: number;
  status: string;
  reason_incomplete?: string;
  date_initiated?: string; // or Date if you parse it
  date_completed?: string; // or Date if you parse it
  customer?: Customer;
  business?: Business;
  items?: any[]; // or TransactionItem[] if you type them later
  dispute?: Dispute;
}