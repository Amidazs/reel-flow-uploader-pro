
import { useState } from "react";
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

type Platform = {
  name: string;
  id: string;
  connected: boolean;
  icon: string;
  color: string;
};

const PlatformConnections = () => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      name: "TikTok",
      id: "tiktok",
      connected: false,
      icon: "🎵",
      color: "#00f2ea",
    },
    {
      name: "YouTube",
      id: "youtube",
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

  const handleConnect = (platformId: string) => {
    // Update the UI state for the connected platform
    setPlatforms(prevPlatforms => 
      prevPlatforms.map(platform => 
        platform.id === platformId ? { ...platform, connected: true } : platform
      )
    );
    
    toast({
      title: "Connected successfully",
      description: `Your ${platformId} account has been connected.`,
    });
  };
  
  const handleDisconnect = (platformId: string) => {
    // Update the UI state for the disconnected platform
    setPlatforms(prevPlatforms => 
      prevPlatforms.map(platform => 
        platform.id === platformId ? { ...platform, connected: false } : platform
      )
    );
    
    toast({
      title: "Disconnected successfully",
      description: `Your ${platformId} account has been disconnected.`,
    });
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
            Note: This is a demonstration with mock data. In a production app, this would initiate the OAuth flow.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PlatformConnections;
