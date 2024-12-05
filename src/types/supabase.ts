export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string; // UUID, Primary Key
          user_id: string; // UUID, Foreign Key referencing auth.users.id
          name: string; // Exercise name
          created_at: string | null; // Timestamp
        };
        Insert: {
          id?: string; // Optional, will be auto-generated
          user_id: string; // UUID, required
          name: string; // Exercise name
          created_at?: string | null; // Optional, will default to now()
        };
        Update: {
          id?: string; // UUID
          user_id?: string; // UUID
          name?: string; // Exercise name
          created_at?: string | null; // Timestamp
        };
      };
      exercise_records: {
        Row: {
          id: string; // UUID, Primary Key
          exercise_id: string; // UUID, Foreign Key referencing exercises.id
          reps: number[]; // Array of integers (reps for each set)
          weights: number[]; // Array of decimals (weights for each set)
          notes: string | null; // Optional notes
          created_at: string | null; // Timestamp
        };
        Insert: {
          id?: string; // Optional, will be auto-generated
          exercise_id: string; // UUID, required
          reps: number[]; // Array of integers
          weights: number[]; // Array of decimals
          notes?: string | null; // Optional
          created_at?: string | null; // Optional, will default to now()
        };
        Update: {
          id?: string; // UUID
          exercise_id?: string; // UUID
          reps?: number[]; // Array of integers
          weights?: number[]; // Array of decimals
          notes?: string | null; // Optional
          created_at?: string | null; // Timestamp
        };
      };
    };
  };
}
