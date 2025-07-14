import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './types';
import { AuthContext } from './context';
import { fetchUserProfile, signUp as serviceSignUp, signIn as serviceSignIn, signOut as serviceSignOut, signInAnonymously as serviceSignInAnonymously } from './service';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setLoading(true);
    console.log('🚀 AuthProvider: Setting up robust auth state listener...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔄 Auth state changed: ${event}`, { hasSession: !!session });

      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setError(null);

      if (currentUser) {
        setTimeout(() => {
          fetchUserProfile(currentUser.id)
            .then(role => {
              if (role) {
                console.log('✅ Role fetched successfully:', role);
                setUserRole(role);
                setLoading(false);
                setAuthReady(true);
                console.log('✅ Auth is ready!');
              } else {
                console.warn('⚠️ No profile found for active session. Signing out to clear stale session.');
                serviceSignOut();
                // State will be cleared and loading/authReady will be handled by the subsequent SIGNED_OUT event.
              }
            })
            .catch(err => {
              console.error('❌ Unhandled error in profile fetch promise:', err);
              setError('An error occurred while fetching your user profile.');
              setUserRole(null); // Fallback on error
              setLoading(false);
              setAuthReady(true);
            });
        }, 0);
      } else {
        console.log('👤 No user session, clearing role and marking auth as ready.');
        setUserRole(null);
        setLoading(false);
        setAuthReady(true);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, role: UserRole = 'end_user') => {
    try {
      setError(null);
      await serviceSignUp(email, password, role);
      return { error: null };
    } catch (err) {
      console.error('❌ Signup exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      return { error: err };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      await serviceSignIn(email, password);
      return { error: null };
    } catch (err) {
      console.error('❌ Signin exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Signin failed';
      setError(errorMessage);
      return { error: err };
    }
  }, []);

  const signInAnonymously = useCallback(async () => {
    try {
      setError(null);
      await serviceSignInAnonymously();
      return { error: null };
    } catch (err) {
      console.error('❌ Anonymous signin exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Anonymous signin failed';
      setError(errorMessage);
      return { error: err };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await serviceSignOut();
      // Manually clear state to ensure UI updates immediately
      setUser(null);
      setSession(null);
      setUserRole(null);
      console.log('🚪 User state cleared manually after sign out.');
    } catch (err) {
      console.error('❌ Signout exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Signout failed';
      setError(errorMessage);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    userRole,
    signUp,
    signIn,
    signInAnonymously,
    signOut,
    loading,
    error,
    authReady,
  }), [user, session, userRole, signUp, signIn, signInAnonymously, signOut, loading, error, authReady]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
