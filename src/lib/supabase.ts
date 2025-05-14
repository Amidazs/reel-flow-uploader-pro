
import { createClient, Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { supabase as integratedSupabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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

  // Sign in with OAuth provider - Updated to fix redirects and OAuth flow
  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    try {
      // Get the current origin for the redirect
      const origin = window.location.origin;
      const redirectTo = `${origin}/settings`;
      
      console.log(`Initiating ${provider} OAuth flow with redirect URL: ${redirectTo}`);
      
      // Configure specific scopes and options based on provider
      const options: any = {
        redirectTo,
      };
      
      // Add provider-specific configurations
      if (provider === 'google') {
        // Updated Google scopes to include YouTube and basic profile
        options.scopes = 'email profile https://www.googleapis.com/auth/youtube';
        options.queryParams = { 
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'true',
        };
      } else if (provider === 'facebook') {
        options.scopes = 'public_profile,email';
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });
      
      if (error) {
        console.error(`OAuth error:`, error);
        toast({
          title: `Failed to connect to ${provider}`,
          description: error.message
        });
        throw error;
      }
      
      console.log(`OAuth flow started:`, data);
      return { data, error: null };
    } catch (error: any) {
      console.error(`Error signing in with ${provider}:`, error);
      toast({
        title: `Failed to connect to ${provider}`,
        description: error.message
      });
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

    // Show success toast
    toast({
      title: `${platformId === 'google' ? 'YouTube' : platformId} connection saved`,
      description: "Connection successfully established"
    });
    
    return { data: result.data, error: null };
  } catch (error) {
    console.error(`Error creating/updating ${platformId} connection:`, error);
    toast({
      title: `Failed to save ${platformId} connection`,
      description: "Please try again."
    });
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
