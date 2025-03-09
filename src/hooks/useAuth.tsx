
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: User | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setData = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          toast.error('Authentication session error. Please try again later.');
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated:', session.user.email);
        }
      } catch (err) {
        console.error('Unexpected error in auth initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initialize the session
    setData();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Show toast notifications based on auth events
        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully!');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully');
        } else if (event === 'PASSWORD_RECOVERY') {
          toast.info('Password recovery initiated');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message || 'Failed to sign in');
      }

      return { data: data.session, error };
    } catch (err) {
      console.error('Unexpected sign in error:', err);
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      toast.error('Authentication failed. Please try again.');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message || 'Failed to sign up');
      } else if (data?.user) {
        toast.success('Sign up successful! Please confirm your email address.');
      }

      return { data: data.user, error };
    } catch (err) {
      console.error('Unexpected sign up error:', err);
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      toast.error('Account creation failed. Please try again.');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error(error.message || 'Failed to sign out');
      }
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      toast.error('Sign out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
