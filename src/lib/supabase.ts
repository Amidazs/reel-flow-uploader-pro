
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

  // Sign in with OAuth provider - Updated to use dynamic redirect URL and better debugging
  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    try {
      // Get the current window's origin for redirect
      const redirectTo = window.location.origin;
      console.log(`Initiating ${provider} OAuth flow with redirect URL: ${redirectTo}`);
      
      // Add timestamp to avoid caching issues with redirects
      const timestamp = new Date().getTime();
      const uniqueRedirect = `${redirectTo}?cache=${timestamp}`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: uniqueRedirect,
          skipBrowserRedirect: false, // Ensure browser redirect happens
          scopes: provider === 'google' ? 'https://www.googleapis.com/auth/youtube' : '', // Add required scopes for YouTube
        },
      });
      
      if (error) {
        console.error(`OAuth error:`, error);
        throw error;
      }
      
      console.log(`OAuth flow started:`, data);
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
    console.log(`Creating/updating platform connection:`, {
      userId,
      platformId,
      accessToken: accessToken ? "present" : "missing",
      refreshToken: refreshToken ? "present" : "missing",
      expiresAt
    });
    
    // First check if connection already exists
    const { data: existing, error: checkError } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform_id', platformId)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing connection:", checkError);
      throw checkError;
    }
    
    let result;
    
    if (existing) {
      // Update existing connection
      console.log(`Updating existing ${platformId} connection for user ${userId}`);
      result = await supabase
        .from('platform_connections')
        .update({
          access_token: accessToken,
          refresh_token: refreshToken || null,
          expires_at: expiresAt || null,
          connected_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select();
    } else {
      // Create new connection
      console.log(`Creating new ${platformId} connection for user ${userId}`);
      result = await supabase
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
    }

    if (result.error) {
      console.error(`Error creating/updating ${platformId} connection:`, result.error);
      throw result.error;
    }
    
    console.log(`Successfully created/updated ${platformId} connection:`, result.data);
    return { data: result.data, error: null };
  } catch (error) {
    console.error(`Error creating/updating ${platformId} connection:`, error);
    return { data: null, error };
  }
};

// Function to delete a platform connection
export const deletePlatformConnection = async (userId: string, platformId: string) => {
  try {
    console.log(`Deleting platform connection: ${platformId} for user ${userId}`);
    
    const { error } = await supabase
      .from('platform_connections')
      .delete()
      .eq('user_id', userId)
      .eq('platform_id', platformId);

    if (error) {
      console.error(`Error deleting ${platformId} connection:`, error);
      throw error;
    }
    
    console.log(`Successfully deleted ${platformId} connection`);
    return { error: null };
  } catch (error) {
    console.error(`Error deleting ${platformId} connection:`, error);
    return { error };
  }
};
