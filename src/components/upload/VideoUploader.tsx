import { useState, useEffect } from "react";
import { useAuthContext } from "@/App";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowRight, Share2, Calendar } from "lucide-react";
import VideoUploadCard from "./VideoUploadCard";
import MetadataForm from "./MetadataForm";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import useVideoUpload from "@/hooks/useVideoUpload";

type Platform = "tiktok" | "youtube" | "facebook";

type VideoMetadata = {
  title: string;
  description: string;
  tags: string;
  visibility: "public" | "private" | "unlisted";
};

interface VideoUploaderProps {
  onUploadComplete?: () => void;
}

const VideoUploader = ({ onUploadComplete }: VideoUploaderProps) => {
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

  // Scheduling state
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState("12:00");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  
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
          console.log("Connected platforms:", platforms);
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

  const getScheduledDateTime = () => {
    if (!scheduleDate || !scheduleTime) return null;
    
    // Parse the time string
    const [hours, minutes] = scheduleTime.split(':').map(num => parseInt(num, 10));
    
    // Create a new date object with the scheduled date and time
    const scheduledDateTime = new Date(scheduleDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    return scheduledDateTime;
  };

  const handleUpload = async () => {
    if (!videoFile) return;
    
    setUploadStep("processing");
    
    try {
      // Calculate scheduled datetime if scheduling is enabled
      const scheduledDateTime = scheduleMode ? getScheduledDateTime() : null;
      
      // First upload to our storage
      const { url, error } = await uploadVideo(videoFile, {
        userId: user?.id,
        platform: "local", 
        metadata: {
          title: metadata.youtube.title || videoFile.name,
          description: metadata.youtube.description,
          tags: metadata.youtube.tags.split(",").map(tag => tag.trim()),
          scheduledFor: scheduledDateTime ? scheduledDateTime.toISOString() : null
        }
      });
      
      if (error) throw error;
      
      // If we have connected platforms, we'd send to them here
      // This would be implemented with edge functions in production
      
      setUploadStep("complete");
      
      // Show appropriate toast message
      if (scheduledDateTime) {
        toast("Upload scheduled", {
          description: `Your video will be published ${format(scheduledDateTime, "PPP 'at' p")}`
        });
      } else {
        toast("Video processed successfully!", {
          description: "Your content is ready to view"
        });
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      toast("Failed to upload video", {
        description: error.message
      });
      setUploadStep("metadata"); // Return to metadata step on failure
    }
  };

  const handleUploadAnother = () => {
    setVideoFile(null);
    setUploadStep("select");
    setScheduleMode(false);
    setScheduleDate(undefined);
    setScheduleTime("12:00");
  };

  const handleCompleteProcess = () => {
    // Call the onUploadComplete callback if provided
    if (onUploadComplete) {
      onUploadComplete();
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
              selectedFile={videoFile}
            />
            
            <MetadataForm onMetadataChange={handleMetadataChange} />
            
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Platform Distribution</h2>
                
                <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setScheduleDialogOpen(true)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {scheduleMode ? 
                        (scheduleDate ? `Scheduled: ${format(scheduleDate, 'PP')}` : 'Schedule upload') : 
                        'Schedule upload'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule your upload</DialogTitle>
                      <DialogDescription>
                        Choose when you want your content to be published.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !scheduleDate && "text-muted-foreground"
                              }`}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {scheduleDate ? format(scheduleDate, "PPP") : "Select a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={scheduleDate}
                              onSelect={setScheduleDate}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Time</label>
                        <Input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setScheduleMode(false);
                          setScheduleDate(undefined);
                          setScheduleDialogOpen(false);
                        }}
                      >
                        Upload immediately
                      </Button>
                      <Button 
                        onClick={() => {
                          setScheduleMode(true);
                          setScheduleDialogOpen(false);
                        }}
                        disabled={!scheduleDate}
                      >
                        Schedule upload
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
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
                  {scheduleMode ? "Schedule for later" : "Process and Upload"}
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
              <h2 className="text-2xl font-bold">
                {scheduleMode ? 'Upload Scheduled!' : 'Upload Complete!'}
              </h2>
              <p className="text-muted-foreground">
                {scheduleMode 
                  ? `Your video has been scheduled for publication${scheduleDate ? ` on ${format(scheduleDate, "PPP 'at' p")}` : ''}.`
                  : 'Your video has been successfully processed and stored.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <Button onClick={handleUploadAnother}>
                  Upload Another Video
                </Button>
                <Button variant="outline" onClick={handleCompleteProcess}>
                  {scheduleMode ? 'View Scheduled Uploads' : 'View Upload History'}
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
