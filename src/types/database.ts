export type UserRole = "admin" | "employee";

export type TransactionType = "deposit" | "deduction";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithAuthor extends Transaction {
  profiles: Pick<Profile, "id" | "full_name" | "email"> | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "email">;
        Update: Partial<Profile>;
      };
      transactions: {
        Row: Transaction;
        Insert: Pick<Transaction, "type" | "amount" | "created_by"> &
          Partial<Pick<Transaction, "note">>;
        Update: Partial<Pick<Transaction, "type" | "amount" | "note">>;
      };
    };
  };
}
