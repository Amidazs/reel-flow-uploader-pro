
import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, X } from "lucide-react";

interface VideoUploadCardProps {
  onVideoSelected: (file: File) => void;
  selectedFile?: File | null;
}

const VideoUploadCard = ({ onVideoSelected, selectedFile }: VideoUploadCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        onVideoSelected(file);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onVideoSelected(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 transition-all ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="video/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        name="videoFile"
      />
      
      {selectedFile ? (
        <div className="flex flex-col items-center justify-center py-4">
          <div className="bg-primary/10 rounded-full p-3 mb-4">
            <File size={24} className="text-primary" />
          </div>
          <h3 className="font-medium mb-1">{selectedFile.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {formatFileSize(selectedFile.size)}
          </p>
          <div className="flex space-x-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleButtonClick}
            >
              Change File
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <UploadCloud
              className="h-10 w-10 text-muted-foreground"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Upload Video</h3>
          <p className="text-muted-foreground max-w-xs mb-6">
            Drag and drop your video file here, or click to select
          </p>
          <Button onClick={handleButtonClick}>Select Video</Button>
        </div>
      )}
    </div>
  );
};

export default VideoUploadCard;
