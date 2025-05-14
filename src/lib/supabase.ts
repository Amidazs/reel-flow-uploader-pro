
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
        console.log("🔐 Initial auth session:", {
          sessionExists: !!data.session,
          userId: data.session?.user?.id,
        });
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('❌ Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔐 Auth state changed:", { event, userId: session?.user?.id });
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
      
      console.group("🔑 OAuth Sign-In Debug");
      console.log(`🔄 Initiating ${provider} OAuth flow with redirect URL: ${redirectTo}`);
      console.log("📊 Current session state:", { 
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      
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
        console.log("🎥 YouTube API scopes configured:", options.scopes);
        console.log("⚙️ Additional Google OAuth parameters:", options.queryParams);
      } else if (provider === 'facebook') {
        options.scopes = 'public_profile,email';
        console.log("📘 Facebook API scopes configured:", options.scopes);
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });
      
      if (error) {
        console.error(`❌ OAuth error:`, error);
        console.groupEnd();
        toast(`Failed to connect to ${provider}`, {
          description: error.message
        });
        throw error;
      }
      
      console.log(`✅ OAuth flow started successfully:`, data);
      console.groupEnd();
      return { data, error: null };
    } catch (error: any) {
      console.error(`❌ Error signing in with ${provider}:`, error);
      console.groupEnd();
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
      console.error('❌ Error signing out:', error);
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
    console.group("💾 Platform Connection Debug");
    console.log("🔄 Creating/updating platform connection with parameters:", {
      userId,
      platform,
      accessTokenLength: accessToken ? accessToken.length : 0,
      refreshTokenExists: !!refreshToken,
      expiresAt,
    });

    // Check if user exists first
    console.log("🔍 Verifying user exists in auth.users table...");
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error("❌ Error verifying user:", userError);
    } else {
      console.log("👤 User check result:", userData);
    }

    // First, check if connection already exists (for debugging)
    console.log("🔍 Checking if platform connection already exists...");
    const { data: existingConn, error: checkError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('platform_id', platform)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Error checking existing connection:", checkError);
    } else {
      console.log("📄 Existing connection check result:", existingConn);
    }

    // Adding extra metadata for debugging
    const connectionData = {
      user_id: userId,
      platform_id: platform,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      connected_at: new Date().toISOString(),
      metadata: {
        debug_info: {
          connection_attempt_time: new Date().toISOString(),
          user_agent: navigator.userAgent,
          screen_size: `${window.innerWidth}x${window.innerHeight}`,
          connection_origin: window.location.origin,
        }
      }
    };
    
    console.log("📝 Preparing connection data:", {
      ...connectionData,
      access_token: connectionData.access_token ? "REDACTED" : null,
      refresh_token: connectionData.refresh_token ? "REDACTED" : null,
    });

    // Insert with detailed logging
    const { data, error } = await supabase
      .from('platform_connections')
      .upsert([connectionData], {
        onConflict: 'user_id,platform_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('❌ Error creating platform connection:', error);
      console.groupEnd();
      toast("Connection failed", {
        description: "Could not save connection data. Please try again."
      });
      return { data: null, error };
    }
    
    console.log('✅ Platform connection created/updated successfully:', data);
    
    // Double-check that the connection was saved
    console.log("🔍 Verifying connection was saved...");
    const { data: verifyData, error: verifyError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('platform_id', platform)
      .single();
      
    if (verifyError) {
      console.error("❌ Error verifying connection was saved:", verifyError);
    } else {
      console.log("✅ Connection verified in database:", {
        ...verifyData,
        access_token: verifyData.access_token ? "REDACTED" : null,
        refresh_token: verifyData.refresh_token ? "REDACTED" : null,
      });
    }
    
    console.groupEnd();
    return { data, error: null };
  } catch (error) {
    console.error('❌ Exception creating platform connection:', error);
    console.groupEnd();
    toast("Connection failed", {
      description: "An unexpected error occurred."
    });
    return { data: null, error };
  }
};

// Delete platform connection
export const deletePlatformConnection = async (userId: string, platformId: string) => {
  try {
    console.group("🗑️ Delete Platform Connection Debug");
    console.log(`🔄 Deleting platform connection: User ID ${userId}, Platform ${platformId}`);
    
    // Check if connection exists first
    const { data: existingConn, error: checkError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('platform_id', platformId)
      .maybeSingle();
      
    if (checkError) {
      console.error("❌ Error checking if connection exists:", checkError);
    } else {
      console.log("🔍 Connection check result:", existingConn ? "Found" : "Not Found");
    }
    
    const { data, error } = await supabase
      .from('platform_connections')
      .delete()
      .match({ user_id: userId, platform_id: platformId });
    
    if (error) {
      console.error('❌ Error deleting platform connection:', error);
      console.groupEnd();
      toast("Error", {
        description: "Failed to disconnect platform. Please try again."
      });
    } else {
      console.log("✅ Platform connection deleted successfully");
    }
    
    console.groupEnd();
    return { data, error };
  } catch (error) {
    console.error('❌ Exception deleting platform connection:', error);
    console.groupEnd();
    toast("Error", {
      description: "An unexpected error occurred while disconnecting."
    });
    return { data: null, error };
  }
};
