export type UserRole = "admin" | "employee";

export type ProfileStatus = "pending" | "approved";

export type TransactionType = "deposit" | "deduction";

export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  status: ProfileStatus;
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
  profiles: Pick<Profile, "id" | "username"> | null;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface ActivityLogWithActor extends ActivityLog {
  profiles: Pick<Profile, "id" | "username"> | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          full_name: string | null;
          role: UserRole;
          status: ProfileStatus;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          full_name?: string | null;
          role?: UserRole;
          status?: ProfileStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          full_name?: string | null;
          role?: UserRole;
          status?: ProfileStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          type: TransactionType;
          amount: number;
          note: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: TransactionType;
          amount: number;
          note?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: TransactionType;
          amount?: number;
          note?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
