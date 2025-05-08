
import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
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
import { supabase, useAuth, deletePlatformConnection } from "@/lib/supabase";

type Platform = {
  name: string;
  id: string;
  connected: boolean;
  icon: string;
  color: string;
};

const PlatformConnections = () => {
  const { toast } = useToast();
  const { user, signInWithOAuth } = useAuth();
  
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      name: "YouTube",
      id: "google",
      connected: false,
      icon: "📺",
      color: "#ff0000",
    },
    {
      name: "Facebook",
      id: "facebook",
      connected: false,
      icon: "👥",
      color: "#1877f2",
    },
  ]);
  
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Fetch existing connections from Supabase on component mount
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        if (!user?.id) return;
        
        const { data, error } = await supabase
          .from('platform_connections')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
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
        }
      } catch (error) {
        console.error('Error fetching platform connections:', error);
        toast({
          title: "Failed to load connections",
          description: "Please refresh the page to try again.",
        });
      }
    };
    
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const handleConnect = async (platformId: string) => {
    try {
      setIsLoading(prev => ({ ...prev, [platformId]: true }));
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to connect your accounts."
        });
        return;
      }

      const { error } = await signInWithOAuth(platformId as 'google' | 'facebook');
      
      if (error) {
        throw error;
      }
      
      // Note: The actual connection will be updated after the OAuth redirect and callback
      // Since this is a redirect-based flow, we won't update the UI here
      
    } catch (error) {
      console.error(`Error connecting to ${platformId}:`, error);
      toast({
        title: "Connection failed",
        description: `Unable to connect to ${platformId}. Please try again.`,
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [platformId]: false }));
    }
  };
  
  const handleDisconnect = async (platformId: string) => {
    try {
      setIsLoading(prev => ({ ...prev, [platformId]: true }));
      
      if (!user?.id) {
        toast({
          title: "Authentication required",
          description: "Please log in to manage your connections."
        });
        return;
      }
      
      const { error } = await deletePlatformConnection(user.id, platformId);
        
      if (error) throw error;
      
      // Update UI
      setPlatforms(prevPlatforms => 
        prevPlatforms.map(platform => 
          platform.id === platformId ? { ...platform, connected: false } : platform
        )
      );
      
      toast({
        title: "Disconnected successfully",
        description: `Your ${platformId} account has been disconnected.`,
      });
    } catch (error) {
      console.error(`Error disconnecting from ${platformId}:`, error);
      toast({
        title: "Disconnection failed",
        description: `Unable to disconnect from ${platformId}. Please try again.`,
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [platformId]: false }));
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Platform Connections</h2>
      
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
                  {platform.connected ? "Connected" : "Not connected"}
                </p>
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
                        Disconnect
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
                    disabled={isLoading[platform.id]}
                  >
                    <Lock className="h-3.5 w-3.5 mr-1" />
                    Connect
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Connect your accounts to enable automatic uploads
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Your API keys and tokens are securely stored in Supabase with encryption
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PlatformConnections;
