
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './types';

export const fetchUserProfile = async (userId: string, retryCount = 0): Promise<UserRole | null> => {
  try {
    console.log(`👤 Fetching user profile for: ${userId} (attempt ${retryCount + 1})`);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to handle non-existent profiles gracefully
    
    if (profileError) {
      console.error('❌ Error fetching user profile:', JSON.stringify(profileError, null, 2));
      
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`🔄 Retrying profile fetch in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchUserProfile(userId, retryCount + 1);
      }
      
      console.error('⚠️ Profile fetch failed after retries.');
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }
    
    if (!profile) {
      console.warn(`🤷 Profile not found for user: ${userId}. This may be a stale session.`);
      return null;
    }
    
    console.log('✅ User profile found:', profile);
    return profile?.role ?? 'end_user';
  } catch (err) {
    console.error('❌ Exception in profile fetch:', err);
    
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`🔄 Retrying after exception in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchUserProfile(userId, retryCount + 1);
    }
    
    throw err;
  }
};

export const signUp = async (email: string, password: string, role: UserRole = 'end_user') => {
    console.log('📝 Attempting signup for:', email, 'with role:', role);
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role: role,
          full_name: '',
        }
      }
    });
    
    console.log('📝 Signup response:', { data, error });
    if (error) throw error;
    
    if (data.user && !data.session) {
      console.log('📧 User created, email confirmation required');
    }
};

export const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting signin for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('🔑 Signin response:', { data, error });
    if (error) throw error;
};

export const signOut = async () => {
    console.log('🚪 Signing out...');
    await supabase.auth.signOut();
};

export const signInAnonymously = async () => {
    console.log('🕵️‍♂️ Attempting anonymous signin...');
    const { data, error } = await supabase.auth.signInAnonymously();
    console.log('🕵️‍♂️ Anonymous signin response:', { data, error });
    if (error) throw error;

    // Supabase does not allow setting custom metadata on anonymous sign-in directly.
    // So, after sign-in, we update the user's profile to set role to 'guest_user'.
    if (data?.user) {
      // Try to update the profile row (if it exists)
      await supabase
        .from('profiles')
        .update({ role: 'guest_user' })
        .eq('id', data.user.id);
    }
};
