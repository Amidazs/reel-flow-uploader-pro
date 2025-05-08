
import { useState } from "react";
import { Upload, X, FileVideo, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type VideoUploadCardProps = {
  onVideoSelected: (file: File) => void;
};

const VideoUploadCard = ({ onVideoSelected }: VideoUploadCardProps) => {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processVideoFile(file);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processVideoFile(e.dataTransfer.files[0]);
    }
  };

  // Process video file
  const processVideoFile = (file: File | undefined) => {
    if (!file) return;
    
    setError(null);
    
    // Check file type
    const validTypes = ["video/mp4", "video/quicktime", "video/webm"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload MP4, MOV, or WEBM files.");
      toast({
        title: "Invalid file type",
        description: "Please upload MP4, MOV, or WEBM files.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      setError("File too large. Maximum size is 100MB.");
      toast({
        title: "File too large",
        description: "Maximum size is 100MB.",
        variant: "destructive"
      });
      return;
    }
    
    setVideoFile(file);
    onVideoSelected(file);
    
    // Create video preview
    const videoUrl = URL.createObjectURL(file);
    setVideoPreview(videoUrl);
    
    // Simulate upload progress for demo
    simulateUploadProgress();
  };

  // Simulate upload progress
  const simulateUploadProgress = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  // Clear selected video
  const clearVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
  };

  return (
    <Card className={`p-6 border-2 transition-all duration-300 ${dragActive ? "border-autoreel-primary border-dashed" : "border-border"} ${error ? "border-destructive" : ""}`}>
      <div
        className="flex flex-col items-center justify-center text-center gap-4"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {videoPreview ? (
          <div className="w-full space-y-4">
            <div className="relative rounded-lg overflow-hidden aspect-video bg-muted">
              <video
                src={videoPreview}
                controls
                className="w-full h-full object-contain"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 rounded-full opacity-80 hover:opacity-100"
                onClick={clearVideo}
              >
                <X size={16} />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{videoFile?.name}</span>
                <span className="text-muted-foreground">
                  {(videoFile?.size ? (videoFile.size / (1024 * 1024)).toFixed(2) : 0)} MB
                </span>
              </div>
              
              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full">
            {error && (
              <div className="text-destructive flex items-center gap-2 mb-4 p-2 bg-destructive/10 rounded-md">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <label
              htmlFor="video-upload"
              className={`flex flex-col items-center justify-center w-full h-64 rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors duration-200`}
            >
              <div className="flex flex-col items-center justify-center p-6 text-center">
                {dragActive ? (
                  <Upload size={48} className="text-autoreel-primary animate-pulse-light" />
                ) : (
                  <FileVideo size={48} className="text-muted-foreground" />
                )}
                <p className="mt-4 text-xl font-semibold">
                  {dragActive ? "Drop video here" : "Drag & drop your video"}
                </p>
                <p className="mt-2 text-muted-foreground text-sm">
                  MP4, MOV or WEBM (max. 100MB)
                </p>
                <Button className="mt-4 button-gradient text-white">
                  Select File
                </Button>
              </div>
              <input
                id="video-upload"
                type="file"
                className="hidden"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoUploadCard;
