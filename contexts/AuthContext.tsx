import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authApi } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.location.href.includes('type=recovery');
    }
    return false;
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(async (err) => {
      console.error('Auth session init error:', err);
      if (err?.message?.includes('Refresh Token Not Found') || err?.message?.includes('Invalid Refresh Token')) {
        // Clear storage to prevent infinite error loops
        try {
          setUser(null);
          const keys = await AsyncStorage.getAllKeys();
          const supabaseKeys = keys.filter(key => key.startsWith('sb-') || key.includes('supabase'));
          if (supabaseKeys.length > 0) {
            await AsyncStorage.multiRemove(supabaseKeys);
          }
        } catch (e) {
          console.error('Failed to clear local storage during error handling:', e);
        }
      }
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth State Change:', event);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        } else if (event === 'SIGNED_OUT') {
          setIsPasswordRecovery(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await authApi.signIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await authApi.signUp(email, password);
  };

  const signOut = async () => {
    try {
      await authApi.signOut();
    } catch (error) {
      console.error('Supabase signOut error:', error);
    } finally {
      setUser(null);
      // Nuke storage to prevent auto-login
      try {
        const keys = await AsyncStorage.getAllKeys();
        const supabaseKeys = keys.filter(key => key.startsWith('sb-') || key.includes('supabase'));
        if (supabaseKeys.length > 0) {
          await AsyncStorage.multiRemove(supabaseKeys);
        }
      } catch (e) {
        console.error('Failed to clear local storage:', e);
      }
    }
  };

  const resetPassword = async (email: string) => {
    await authApi.resetPassword(email);
  };

  const updateEmail = async (email: string) => {
    await authApi.updateUser({ email });
  };

  const updatePassword = async (password: string) => {
    await authApi.updateUser({ password });
  };

  const deleteAccount = async () => {
    await authApi.deleteUser();
    await signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isPasswordRecovery,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateEmail,
      updatePassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}