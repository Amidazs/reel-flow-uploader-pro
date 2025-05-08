
import { useState } from "react";
import { Upload, Image, RefreshCw, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type ThumbnailSelectorProps = {
  videoFile: File | null;
  onThumbnailSelected: (file: File | null, url: string | null) => void;
};

const ThumbnailSelector = ({ videoFile, onThumbnailSelected }: ThumbnailSelectorProps) => {
  const { toast } = useToast();
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  // Handle file selection for custom thumbnail
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum size is 5MB.",
        variant: "destructive"
      });
      return;
    }

    const thumbnailUrl = URL.createObjectURL(file);
    setThumbnailImage(thumbnailUrl);
    setIsCustom(true);
    onThumbnailSelected(file, thumbnailUrl);
  };

  // Generate thumbnail from video
  const generateThumbnail = () => {
    if (!videoFile) {
      toast({
        title: "No video selected",
        description: "Please upload a video first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    // Simulate thumbnail generation
    setTimeout(() => {
      setIsCustom(false);
      // For demo purposes, we'll create a placeholder thumbnail
      // In a real app, we would extract a frame from the video
      const demoThumbnail = "/placeholder.svg";
      setThumbnailImage(demoThumbnail);
      setIsGenerating(false);
      
      toast({
        title: "Thumbnail generated",
        description: "Thumbnail has been created from your video.",
        variant: "default"
      });
      
      // In a real app, we would create a File object from the generated thumbnail
      onThumbnailSelected(null, demoThumbnail);
    }, 2000);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Thumbnail</h2>

      <div className="space-y-4">
        {thumbnailImage ? (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={thumbnailImage}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
              {isCustom && (
                <div className="absolute top-2 right-2 bg-background/80 rounded-full p-1 backdrop-blur-sm">
                  <span className="text-xs font-medium text-foreground px-2 py-1">Custom</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateThumbnail}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} className="mr-2" />
                    Regenerate
                  </>
                )}
              </Button>
              
              <div className="flex-1 relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => document.getElementById("thumbnail-upload")?.click()}
                >
                  <Upload size={16} className="mr-2" />
                  Upload Custom
                </Button>
                <input
                  id="thumbnail-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="aspect-video w-full bg-muted/50 rounded-lg flex flex-col items-center justify-center p-6">
              <Image size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No thumbnail selected
              </p>
              
              <div className="flex flex-wrap gap-2 w-full max-w-xs">
                <Button
                  variant="default"
                  className="button-gradient text-white flex-1"
                  onClick={generateThumbnail}
                  disabled={!videoFile || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      Auto-Generate
                    </>
                  )}
                </Button>
                
                <div className="flex-1 relative">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById("thumbnail-upload")?.click()}
                    disabled={!videoFile}
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Custom
                  </Button>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              For best results, use a 16:9 image (1280×720 or larger)
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ThumbnailSelector;
