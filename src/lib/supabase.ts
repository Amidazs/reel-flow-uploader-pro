
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
        toast(`Failed to connect to ${provider}`, {
          description: error.message
        });
        throw error;
      }
      
      console.log(`OAuth flow started:`, data);
      return { data, error: null };
    } catch (error: any) {
      console.error(`Error signing in with ${provider}:`, error);
      toast(`Failed to connect to ${provider}`, {
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

// Create or update platform connection
export const createOrUpdatePlatformConnection = async (
  userId: string, 
  platform: string,
  accessToken: string,
  refreshToken: string | null,
  expiresAt: string | null
) => {
  try {
    const { data, error } = await supabase
      .from('platform_connections')
      .upsert([
        {
          user_id: userId,
          platform_id: platform,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
          connected_at: new Date().toISOString(),
        }
      ], {
        onConflict: 'user_id,platform_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error creating platform connection:', error);
      toast("Connection failed", {
        description: "Could not save connection data. Please try again."
      });
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception creating platform connection:', error);
    toast("Connection failed", {
      description: "An unexpected error occurred."
    });
    return { data: null, error };
  }
};

// Delete platform connection
export const deletePlatformConnection = async (userId: string, platformId: string) => {
  try {
    const { data, error } = await supabase
      .from('platform_connections')
      .delete()
      .match({ user_id: userId, platform_id: platformId });
    
    if (error) {
      toast("Error", {
        description: "Failed to disconnect platform. Please try again."
      });
      console.error('Error deleting platform connection:', error);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Exception deleting platform connection:', error);
    toast("Error", {
      description: "An unexpected error occurred while disconnecting."
    });
    return { data: null, error };
  }
};
