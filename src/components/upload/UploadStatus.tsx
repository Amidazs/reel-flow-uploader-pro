
import { useState } from "react";
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

type UploadStatusType = "pending" | "uploading" | "complete" | "failed";

type PlatformUploadStatus = {
  platform: string;
  icon: string;
  color: string;
  status: UploadStatusType;
  progress: number;
  url?: string;
  error?: string;
};

type UploadStatusProps = {
  videoTitle?: string;
};

const UploadStatus = ({ videoTitle = "Untitled Video" }: UploadStatusProps) => {
  // In a real app, these would be based on actual API responses
  const [uploadStatuses, setUploadStatuses] = useState<PlatformUploadStatus[]>([
    {
      platform: "TikTok",
      icon: "🎵",
      color: "#00f2ea",
      status: "pending",
      progress: 0,
    },
    {
      platform: "YouTube",
      icon: "📺",
      color: "#ff0000",
      status: "pending",
      progress: 0,
    },
    {
      platform: "Facebook",
      icon: "👥",
      color: "#1877f2",
      status: "pending",
      progress: 0,
    },
  ]);

  // Function to start uploads - this would trigger API calls in a real app
  const startUploads = () => {
    // Update all to uploading
    setUploadStatuses(
      uploadStatuses.map((status) => ({
        ...status,
        status: "uploading",
        progress: 0,
      }))
    );

    // Simulate progress for demo
    simulateUploadProgress();
  };

  // Simulate upload progress for demo
  const simulateUploadProgress = () => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      
      setUploadStatuses((prevStatuses) => {
        const newStatuses = [...prevStatuses];
        
        // TikTok completes successfully
        if (tick >= 6 && newStatuses[0].status === "uploading") {
          newStatuses[0] = {
            ...newStatuses[0],
            status: "complete",
            progress: 100,
            url: "https://tiktok.com/video/123456",
          };
        } else if (newStatuses[0].status === "uploading") {
          newStatuses[0] = {
            ...newStatuses[0],
            progress: Math.min(100, newStatuses[0].progress + 16),
          };
        }
        
        // YouTube completes successfully but with delay
        if (tick >= 10 && newStatuses[1].status === "uploading") {
          newStatuses[1] = {
            ...newStatuses[1],
            status: "complete",
            progress: 100,
            url: "https://youtube.com/shorts/123456",
          };
        } else if (newStatuses[1].status === "uploading") {
          newStatuses[1] = {
            ...newStatuses[1],
            progress: Math.min(100, newStatuses[1].progress + 10),
          };
        }
        
        // Facebook fails
        if (tick >= 8 && newStatuses[2].status === "uploading") {
          newStatuses[2] = {
            ...newStatuses[2],
            status: "failed",
            progress: 75,
            error: "API Error: Invalid credentials",
          };
        } else if (newStatuses[2].status === "uploading") {
          newStatuses[2] = {
            ...newStatuses[2],
            progress: Math.min(75, newStatuses[2].progress + 12),
          };
        }
        
        return newStatuses;
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
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Upload Status</h2>
        <Button
          onClick={startUploads}
          disabled={anyUploading || !allPending}
          className={allPending ? "button-gradient text-white" : ""}
        >
          {anyUploading ? "Uploading..." : allPending ? "Start Uploads" : "Upload Complete"}
        </Button>
      </div>

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
    </Card>
  );
};

export default UploadStatus;
