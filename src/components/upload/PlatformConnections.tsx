
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Platform = {
  name: string;
  id: string;
  connected: boolean;
  icon: string;
  color: string;
};

const platforms: Platform[] = [
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
];

const PlatformConnections = () => {
  const handleConnect = (platformId: string) => {
    // In a real app, this would initiate OAuth flow
    alert(`Connecting to ${platformId}...`);
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                        >
                          Disconnect
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove access to this account</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
        </div>
      </div>
    </Card>
  );
};

export default PlatformConnections;
