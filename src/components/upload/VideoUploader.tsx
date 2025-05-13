
import { useState, useEffect } from "react";
import { useAuthContext } from "@/App";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowRight, Share2 } from "lucide-react";
import VideoUploadCard from "./VideoUploadCard";
import MetadataForm from "./MetadataForm";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import useVideoUpload from "@/hooks/useVideoUpload";

type Platform = "tiktok" | "youtube" | "facebook";

type VideoMetadata = {
  title: string;
  description: string;
  tags: string;
  visibility: "public" | "private" | "unlisted";
};

const VideoUploader = () => {
  const { user } = useAuthContext();
  const { uploadVideo, isUploading, progress } = useVideoUpload();
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<"select" | "metadata" | "processing" | "complete">("select");
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<Platform, VideoMetadata>>({
    tiktok: { title: "", description: "", tags: "", visibility: "public" },
    youtube: { title: "", description: "", tags: "", visibility: "public" },
    facebook: { title: "", description: "", tags: "", visibility: "public" },
  });

  // Fetch connected platforms when component mounts
  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('platform_connections')
          .select('platform_id')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        if (data) {
          const platforms = data.map(conn => conn.platform_id);
          setConnectedPlatforms(platforms);
        }
      } catch (error) {
        console.error("Error fetching platform connections:", error);
      }
    };
    
    fetchConnections();
  }, [user]);

  const handleVideoSelected = (file: File) => {
    setVideoFile(file);
    // Automatically move to metadata step
    setTimeout(() => setUploadStep("metadata"), 1500);
  };

  const handleMetadataChange = (platform: Platform, data: VideoMetadata) => {
    setMetadata(prev => ({
      ...prev,
      [platform]: data
    }));
  };

  const handleUpload = async () => {
    if (!videoFile || !user) return;
    
    setUploadStep("processing");
    
    try {
      // First upload to our storage
      const { url, error } = await uploadVideo(videoFile, {
        userId: user.id,
        platform: "local", 
        metadata: {
          title: metadata.youtube.title || videoFile.name,
          description: metadata.youtube.description,
          tags: metadata.youtube.tags.split(",").map(tag => tag.trim()),
        }
      });
      
      if (error) throw error;
      
      // If we have connected platforms, we'd send to them here
      // This would be implemented with edge functions in production
      
      setUploadStep("complete");
      toast.success("Video processed successfully!");
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video: " + error.message);
      setUploadStep("metadata"); // Return to metadata step on failure
    }
  };

  const renderStepContent = () => {
    switch (uploadStep) {
      case "select":
        return (
          <VideoUploadCard 
            onVideoSelected={handleVideoSelected} 
          />
        );
        
      case "metadata":
        return (
          <div className="space-y-6">
            <VideoUploadCard 
              onVideoSelected={handleVideoSelected} 
            />
            
            <MetadataForm onMetadataChange={handleMetadataChange} />
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Platform Distribution</h2>
              
              <div className="space-y-4">
                {connectedPlatforms.length > 0 ? (
                  <>
                    <p className="text-sm">Your video will be uploaded to:</p>
                    <div className="space-y-2">
                      {connectedPlatforms.includes('google') && (
                        <div className="flex items-center p-3 bg-red-50 rounded-md">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            📺
                          </div>
                          <div>
                            <p className="font-medium">YouTube</p>
                            <p className="text-xs text-muted-foreground">
                              As: {metadata.youtube.title || "Untitled"}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {connectedPlatforms.includes('facebook') && (
                        <div className="flex items-center p-3 bg-blue-50 rounded-md">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            👥
                          </div>
                          <div>
                            <p className="font-medium">Facebook</p>
                            <p className="text-xs text-muted-foreground">
                              As: {metadata.facebook.title || "Untitled"}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {!connectedPlatforms.includes('google') && !connectedPlatforms.includes('facebook') && (
                        <Alert>
                          <AlertDescription>
                            No platforms connected. Your video will be stored locally only.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </>
                ) : (
                  <Alert>
                    <AlertDescription>
                      No platforms connected. Connect platforms in Settings to enable distribution.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  className="w-full mt-6" 
                  onClick={handleUpload}
                  disabled={!videoFile}
                >
                  Process and Upload
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        );
        
      case "processing":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Processing Your Video</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-center mb-2">
                  {progress < 100 ? "Uploading..." : "Processing..."}
                </p>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {progress < 100 ? `${progress}% complete` : "Preparing your content for distribution"}
                </p>
              </div>
              
              {videoFile && (
                <div className="p-4 bg-muted rounded-md">
                  <p className="font-medium">{videoFile.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </Card>
        );
        
      case "complete":
        return (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Upload Complete!</h2>
              <p className="text-muted-foreground">
                Your video has been successfully processed and stored.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <Button onClick={() => setUploadStep("select")}>
                  Upload Another Video
                </Button>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderStepContent()}
    </div>
  );
};

export default VideoUploader;
