
import { User, Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

export type UserRole = Database['public']['Enums']['user_role'];

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  signUp: (email: string, password: string, role?: UserRole) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAnonymously: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
  authReady: boolean;
}
