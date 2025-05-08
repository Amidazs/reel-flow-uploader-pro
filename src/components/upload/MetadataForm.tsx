
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Platform-specific character limits
const PLATFORM_LIMITS = {
  tiktok: {
    title: 100,
    description: 2200,
    tags: 20, // Max number of tags
  },
  youtube: {
    title: 100,
    description: 5000,
    tags: 500, // Character limit for all tags
  },
  facebook: {
    title: 100,
    description: 2000,
    tags: 30, // Max number of tags
  },
};

type Platform = "tiktok" | "youtube" | "facebook";

export type VideoMetadata = {
  title: string;
  description: string;
  tags: string;
  visibility: "public" | "private" | "unlisted";
};

type MetadataFormProps = {
  onMetadataChange: (platform: Platform, metadata: VideoMetadata) => void;
};

const MetadataForm = ({ onMetadataChange }: MetadataFormProps) => {
  const [activeTab, setActiveTab] = useState<Platform>("tiktok");
  
  const [metadata, setMetadata] = useState<Record<Platform, VideoMetadata>>({
    tiktok: { title: "", description: "", tags: "", visibility: "public" },
    youtube: { title: "", description: "", tags: "", visibility: "public" },
    facebook: { title: "", description: "", tags: "", visibility: "public" },
  });

  const handleChange = (
    platform: Platform,
    field: keyof VideoMetadata,
    value: string
  ) => {
    const updatedMetadata = {
      ...metadata[platform],
      [field]: value,
    };
    
    setMetadata({
      ...metadata,
      [platform]: updatedMetadata,
    });
    
    onMetadataChange(platform, updatedMetadata);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as Platform);
  };

  const getCharacterCount = (platform: Platform, field: "title" | "description") => {
    const text = metadata[platform][field];
    const limit = PLATFORM_LIMITS[platform][field];
    return `${text.length}/${limit}`;
  };

  const isOverLimit = (platform: Platform, field: "title" | "description") => {
    const text = metadata[platform][field];
    const limit = PLATFORM_LIMITS[platform][field];
    return text.length > limit;
  };

  // Function to apply metadata across all platforms
  const applyToAll = () => {
    const currentMetadata = metadata[activeTab];
    setMetadata({
      tiktok: { ...currentMetadata },
      youtube: { ...currentMetadata },
      facebook: { ...currentMetadata },
    });
    
    // Notify parent about changes
    onMetadataChange("tiktok", currentMetadata);
    onMetadataChange("youtube", currentMetadata);
    onMetadataChange("facebook", currentMetadata);
  };

  const platformIcons = {
    tiktok: "🎵",
    youtube: "📺",
    facebook: "👥"
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Video Metadata</h2>
      
      <Tabs 
        defaultValue="tiktok" 
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="tiktok" className="data-[state=active]:bg-[#00f2ea]/10 data-[state=active]:text-[#00f2ea]">
            {platformIcons.tiktok} TikTok
          </TabsTrigger>
          <TabsTrigger value="youtube" className="data-[state=active]:bg-[#ff0000]/10 data-[state=active]:text-[#ff0000]">
            {platformIcons.youtube} YouTube
          </TabsTrigger>
          <TabsTrigger value="facebook" className="data-[state=active]:bg-[#1877f2]/10 data-[state=active]:text-[#1877f2]">
            {platformIcons.facebook} Facebook
          </TabsTrigger>
        </TabsList>

        {(["tiktok", "youtube", "facebook"] as const).map((platform) => (
          <TabsContent key={platform} value={platform} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor={`${platform}-title`}>Title</Label>
                <span className={`text-xs ${
                  isOverLimit(platform, "title") ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {getCharacterCount(platform, "title")}
                </span>
              </div>
              <Input
                id={`${platform}-title`}
                value={metadata[platform].title}
                onChange={(e) => handleChange(platform, "title", e.target.value)}
                placeholder={`Enter ${platform} title...`}
                className="input-focus"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor={`${platform}-desc`}>Description</Label>
                <span className={`text-xs ${
                  isOverLimit(platform, "description") ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {getCharacterCount(platform, "description")}
                </span>
              </div>
              <Textarea
                id={`${platform}-desc`}
                value={metadata[platform].description}
                onChange={(e) => handleChange(platform, "description", e.target.value)}
                placeholder={`Enter ${platform} description...`}
                className="min-h-[120px] input-focus"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${platform}-tags`}>Tags</Label>
              <Input
                id={`${platform}-tags`}
                value={metadata[platform].tags}
                onChange={(e) => handleChange(platform, "tags", e.target.value)}
                placeholder="Enter tags separated by commas..."
                className="input-focus"
              />
              <p className="text-xs text-muted-foreground">
                {platform === "tiktok" && "Max 20 tags"}
                {platform === "youtube" && "Max 500 characters"}
                {platform === "facebook" && "Max 30 tags"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${platform}-visibility`}>Visibility</Label>
              <Select
                value={metadata[platform].visibility}
                onValueChange={(value) => 
                  handleChange(platform, "visibility", value as "public" | "private" | "unlisted")
                }
              >
                <SelectTrigger id={`${platform}-visibility`} className="input-focus">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeTab === platform && (
              <div className="pt-4">
                <button
                  onClick={applyToAll}
                  className="text-sm text-autoreel-primary hover:text-autoreel-tertiary transition-colors"
                  type="button"
                >
                  Apply to all platforms
                </button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};

export default MetadataForm;
