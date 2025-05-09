
import { createClient, Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { supabase as integratedSupabase } from '@/integrations/supabase/client';

// Use the integrated Supabase client that's already properly configured
export const supabase = integratedSupabase;

// Custom hook to handle authentication
export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session and user
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in with OAuth provider - Updated to use new window
  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/settings`,
          skipBrowserRedirect: false,  // Ensure browser redirect happens
        },
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  return {
    session,
    user,
    loading,
    signInWithOAuth,
    signOut,
  };
};

// Function to create or update platform connections for a user
export const createOrUpdatePlatformConnection = async (
  userId: string,
  platformId: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: string
) => {
  try {
    const { data, error } = await supabase
      .from('platform_connections')
      .insert({
        user_id: userId,
        platform_id: platformId,
        connected_at: new Date().toISOString(),
        access_token: accessToken,
        refresh_token: refreshToken || null,
        expires_at: expiresAt || null,
      })
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error creating/updating ${platformId} connection:`, error);
    return { data: null, error };
  }
};

// Function to delete a platform connection
export const deletePlatformConnection = async (userId: string, platformId: string) => {
  try {
    const { error } = await supabase
      .from('platform_connections')
      .delete()
      .eq('user_id', userId)
      .eq('platform_id', platformId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting ${platformId} connection:`, error);
    return { error };
  }
};
