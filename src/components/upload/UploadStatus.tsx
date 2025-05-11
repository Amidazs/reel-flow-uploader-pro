
import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/App";

type UploadStatusType = "pending" | "uploading" | "complete" | "failed";

type PlatformUploadStatus = {
  platform: string;
  icon: string;
  color: string;
  status: UploadStatusType;
  progress: number;
  url?: string;
  error?: string;
  id?: string;
};

type UploadStatusProps = {
  videoTitle?: string;
};

const UploadStatus = ({ videoTitle = "Untitled Video" }: UploadStatusProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [uploadStatuses, setUploadStatuses] = useState<PlatformUploadStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Platform metadata
  const platformMeta = {
    tiktok: { icon: "🎵", color: "#00f2ea" },
    youtube: { icon: "📺", color: "#ff0000" },
    facebook: { icon: "👥", color: "#1877f2" },
  };

  // Fetch connected platforms
  useEffect(() => {
    const fetchConnectedPlatforms = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get user connected platforms
        const { data: connections, error } = await supabase
          .from('platform_connections')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Create initial status entries for each connected platform
        const initialStatuses = connections?.map(connection => ({
          platform: connection.platform_id.charAt(0).toUpperCase() + connection.platform_id.slice(1),
          icon: platformMeta[connection.platform_id as keyof typeof platformMeta]?.icon || "📱",
          color: platformMeta[connection.platform_id as keyof typeof platformMeta]?.color || "#555555",
          status: "pending" as UploadStatusType,
          progress: 0,
          id: connection.id
        })) || [];
        
        setUploadStatuses(initialStatuses);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching platform connections:", error);
        toast({
          title: "Failed to load platforms",
          description: "Could not retrieve your connected platforms",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchConnectedPlatforms();
  }, [user, toast]);

  // Function to start uploads - this would trigger API calls in a real app
  const startUploads = async () => {
    if (uploadStatuses.length === 0) {
      toast({
        title: "No platforms connected",
        description: "Connect at least one platform before uploading",
        variant: "destructive"
      });
      return;
    }

    // Update all to uploading
    setUploadStatuses(
      uploadStatuses.map((status) => ({
        ...status,
        status: "uploading",
        progress: 0,
      }))
    );

    // Start simulated upload process (in real app, this would make API calls)
    simulateUploadProgress();
    
    // In a real implementation, we would create video_uploads records in Supabase here
    if (user) {
      try {
        // For demonstration purposes, create upload records in Supabase
        for (const status of uploadStatuses) {
          await supabase.from("video_uploads").insert({
            user_id: user.id,
            platform_id: status.platform.toLowerCase(),
            title: videoTitle,
            description: `Uploaded via AutoReel on ${new Date().toLocaleDateString()}`,
            tags: ["autoreel", "demo"],
            file_name: `${videoTitle.replace(/\s+/g, '-').toLowerCase()}.mp4`
          });
        }
      } catch (error) {
        console.error("Error creating upload records:", error);
      }
    }
  };

  // Simulate upload progress for demo
  const simulateUploadProgress = () => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      
      setUploadStatuses((prevStatuses) => {
        const newStatuses = [...prevStatuses];
        
        // Update each platform with simulated progress
        return newStatuses.map((status, index) => {
          if (status.status !== "uploading") return status;
          
          // Different completion rates for different platforms
          const speedFactor = index === 0 ? 16 : index === 1 ? 10 : 12;
          const maxProgress = index === 2 ? 75 : 100; // Facebook "fails" at 75%
          
          // Simulate completion or failure
          if (tick >= 6 + index * 2 && index !== 2) {
            return {
              ...status,
              status: "complete",
              progress: 100,
              url: `https://${status.platform.toLowerCase()}.com/video/123456`,
            };
          } else if (tick >= 8 && index === 2) {
            return {
              ...status,
              status: "failed",
              progress: 75,
              error: "API Error: Invalid credentials",
            };
          } else {
            return {
              ...status,
              progress: Math.min(maxProgress, status.progress + speedFactor),
            };
          }
        });
      });
      
      // Clear interval when all uploads are complete or failed
      if (tick >= 12) {
        clearInterval(interval);
      }
    }, 800);
  };

  // Retry failed uploads
  const retryUpload = (platform: string) => {
    setUploadStatuses(
      uploadStatuses.map((status) =>
        status.platform === platform
          ? { ...status, status: "uploading", progress: 0, error: undefined }
          : status
      )
    );

    // Simulate successful retry for demo
    setTimeout(() => {
      setUploadStatuses(
        uploadStatuses.map((status) =>
          status.platform === platform
            ? {
                ...status,
                status: "complete",
                progress: 100,
                url: `https://${platform.toLowerCase()}.com/video/123456`,
                error: undefined,
              }
            : status
        )
      );
    }, 5000);
  };

  const renderStatusIcon = (status: UploadStatusType) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 size={18} className="text-green-500" />;
      case "failed":
        return <XCircle size={18} className="text-red-500" />;
      case "pending":
        return <Clock size={18} className="text-muted-foreground" />;
      case "uploading":
        return <RotateCw size={18} className="text-blue-500 animate-spin" />;
    }
  };

  const allPending = uploadStatuses.every((s) => s.status === "pending");
  const anyUploading = uploadStatuses.some((s) => s.status === "uploading");
  
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Status</h2>
        </div>
        <div className="py-8 text-center text-muted-foreground">
          <RotateCw size={24} className="animate-spin mx-auto mb-3" />
          <p>Loading connected platforms...</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Upload Status</h2>
        <Button
          onClick={startUploads}
          disabled={anyUploading || uploadStatuses.length === 0}
          className={allPending && uploadStatuses.length > 0 ? "button-gradient text-white" : ""}
        >
          {anyUploading ? "Uploading..." : allPending ? "Start Uploads" : "Upload Complete"}
        </Button>
      </div>

      {uploadStatuses.length === 0 ? (
        <div className="py-8 text-center bg-muted/30 rounded-md">
          <p className="text-muted-foreground mb-2">No platforms connected</p>
          <p className="text-sm text-muted-foreground">Connect at least one platform to upload videos</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadStatuses.map((status) => (
                  <TableRow key={status.platform}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${status.color}20` }}
                        >
                          {status.icon}
                        </span>
                        <span>{status.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {renderStatusIcon(status.status)}
                        <span>
                          {status.status.charAt(0).toUpperCase() +
                            status.status.slice(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-1/3">
                      <div className="space-y-1">
                        <Progress value={status.progress} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {status.progress}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {status.status === "failed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryUpload(status.platform)}
                          className="text-autoreel-primary"
                        >
                          <RotateCw size={14} className="mr-1" />
                          Retry
                        </Button>
                      )}
                      {status.status === "complete" && status.url && (
                        <a
                          href={status.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-autoreel-primary text-sm hover:underline"
                        >
                          View Post
                        </a>
                      )}
                      {(status.status === "pending" || status.status === "uploading") && (
                        <span className="text-sm text-muted-foreground">
                          {status.status === "uploading" ? "Processing..." : "Waiting..."}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {uploadStatuses.some((s) => s.status === "failed") && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-sm text-red-500">
                Some uploads failed. Please check your connections and try again.
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default UploadStatus;
