
import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle, Lock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { supabase, useAuth, deletePlatformConnection } from "@/lib/supabase";
import { useAuthContext } from "@/App";
import { useQueryClient } from "@tanstack/react-query";

type Platform = {
  name: string;
  id: string;
  connected: boolean;
  icon: string;
  color: string;
  description: string;
  limitedAccess?: boolean; // Added flag for platforms with limited development access
};

const PlatformConnections = () => {
  const { toast: shadcnToast } = useToast();
  const { user, signInWithOAuth } = useAuthContext();
  const queryClient = useQueryClient();
  
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      name: "YouTube",
      id: "google",
      connected: false,
      icon: "📺",
      color: "#ff0000",
      description: "Upload videos to your YouTube channel",
      limitedAccess: true
    },
    {
      name: "Facebook",
      id: "facebook",
      connected: false,
      icon: "👥",
      color: "#1877f2",
      description: "Share content to Facebook pages or profile",
      limitedAccess: true
    },
  ]);
  
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to fetch connections - extracted for reusability
  const fetchConnections = useCallback(async () => {
    try {
      if (!user?.id) {
        setIsInitialLoading(false);
        return;
      }
      
      console.log("Fetching platform connections for user:", user.id);
      
      const { data, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching connections:", error);
        throw error;
      }
      
      console.log("Fetched platform connections:", data);
      
      if (data && data.length > 0) {
        // Update platforms with connection status from database
        const updatedPlatforms = platforms.map(platform => {
          const connection = data.find(conn => conn.platform_id === platform.id);
          return {
            ...platform,
            connected: !!connection
          };
        });
        setPlatforms(updatedPlatforms);
        console.log("Updated platforms with connection status:", updatedPlatforms);
      } else {
        // Reset connections if none found
        const resetPlatforms = platforms.map(platform => ({
          ...platform,
          connected: false
        }));
        setPlatforms(resetPlatforms);
      }

      setIsInitialLoading(false);
    } catch (error) {
      console.error('Error fetching platform connections:', error);
      toast.error("Failed to load connections. Please refresh the page to try again.");
      setIsInitialLoading(false);
    }
  }, [user, platforms]);
  
  // Fetch existing connections from Supabase on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchConnections();
    
    // Set up event listener for when window regains focus
    const handleFocus = () => {
      console.log("Window focused, refreshing connections...");
      fetchConnections();
    };

    window.addEventListener('focus', handleFocus);

    // Force refresh every 10 seconds while on settings page to catch any updates
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible' && window.location.pathname === '/settings') {
        console.log("Periodic refresh of connections");
        fetchConnections();
      }
    }, 10000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [fetchConnections, refreshTrigger]);  

  const handleConnect = async (platformId: string) => {
    try {
      setIsLoading(prev => ({ ...prev, [platformId]: true }));
      
      if (!user) {
        toast.error("Authentication required. Please log in to connect your accounts.");
        return;
      }

      console.log(`Initiating connection to ${platformId}...`);
      
      // Show platform-specific messages
      const platformName = platformId === 'google' ? 'YouTube' : platformId.charAt(0).toUpperCase() + platformId.slice(1);
      
      toast.info(`${platformName} authorization will open in a new window. Please ensure popup blockers are disabled.`);
      
      if (platformId === 'google') {
        toast.info("Note: This is a development app with limited access. You'll need to click 'Continue' on the unverified app screen.");
      }
      
      // Reset refresh trigger to force new fetch after OAuth completes
      setRefreshTrigger(prev => prev + 1);
      
      const { data, error } = await signInWithOAuth(platformId as 'google' | 'facebook');
      
      if (error) {
        console.error(`Error during OAuth flow:`, error);
        throw error;
      }
      
      console.log(`OAuth initiated successfully`, data);
      
    } catch (error) {
      console.error(`Error connecting to ${platformId}:`, error);
      toast.error(`Unable to connect to ${platformId === 'google' ? 'YouTube' : platformId}. Please check your browser settings and try again.`);
    } finally {
      setIsLoading(prev => ({ ...prev, [platformId]: false }));
    }
  };
  
  const handleDisconnect = async (platformId: string) => {
    try {
      setIsLoading(prev => ({ ...prev, [platformId]: true }));
      
      if (!user?.id) {
        toast.error("Authentication required. Please log in to manage your connections.");
        return;
      }
      
      console.log(`Disconnecting platform: ${platformId}`);
      
      const { error } = await deletePlatformConnection(user.id, platformId);
        
      if (error) {
        console.error("Error disconnecting platform:", error);
        throw error;
      }
      
      console.log(`Platform disconnected: ${platformId}`);
      
      // Update UI
      setPlatforms(prevPlatforms => 
        prevPlatforms.map(platform => 
          platform.id === platformId ? { ...platform, connected: false } : platform
        )
      );
      
      // Force refresh
      setRefreshTrigger(prev => prev + 1);
      
      const platformName = platformId === 'google' ? 'YouTube' : platformId;
      toast.success(`Your ${platformName} account has been disconnected.`);
    } catch (error) {
      console.error(`Error disconnecting from ${platformId}:`, error);
      toast.error(`Unable to disconnect from ${platformId === 'google' ? 'YouTube' : platformId}. Please try again.`);
    } finally {
      setIsLoading(prev => ({ ...prev, [platformId]: false }));
    }
  };

  // Manually trigger refresh
  const handleManualRefresh = () => {
    setIsInitialLoading(true);
    setRefreshTrigger(prev => prev + 1);
    toast.info("Refreshing connections...");
  };

  if (isInitialLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading platform connections...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Platform Connections</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleManualRefresh} 
          className="text-xs flex items-center gap-1"
        >
          <Loader2 className={`h-3 w-3 ${isInitialLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {!user && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            You need to sign in to manage your platform connections.
          </p>
        </div>
      )}
      
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-800">
          {platforms.some(p => p.connected) 
            ? "Your accounts are connected. You can upload content to these platforms."
            : "These are development connections with limited access. You may see 'unverified app' warnings."}
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: `${platform.color}20` }}
              >
                {platform.icon}
              </div>
              <div>
                <h3 className="font-medium">{platform.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {platform.connected ? "Connected" : platform.description}
                </p>
                {platform.limitedAccess && !platform.connected && (
                  <span className="text-xs text-amber-600">
                    Development access only
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {platform.connected ? (
                <>
                  <CheckCircle2 size={18} className="text-green-500" />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                        disabled={isLoading[platform.id]}
                      >
                        {isLoading[platform.id] ? (
                          <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          "Disconnect"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Disconnect {platform.name}</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove access to your {platform.name} account. You'll need to reconnect to upload videos to {platform.name}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDisconnect(platform.id)}>Disconnect</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <>
                  <AlertCircle size={18} className="text-amber-500" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-autoreel-primary/20 text-autoreel-primary hover:bg-autoreel-primary/10"
                    onClick={() => handleConnect(platform.id)}
                    disabled={isLoading[platform.id] || !user}
                  >
                    {isLoading[platform.id] ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 mr-1" />
                        Connect
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        {platform => platform.id === 'facebook' && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Facebook development note:</strong> To test Facebook connection, you need to add your account as a test user in Facebook Developer settings.
            </p>
            <a 
              href="https://developers.facebook.com/tools/explorer/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Learn more about Facebook test accounts
            </a>
          </div>
        )}

        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Connect your accounts to enable automatic uploads
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            In development mode, access is limited to app testers only
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PlatformConnections;
