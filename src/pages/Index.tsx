
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import VideoUploadCard from "@/components/upload/VideoUploadCard";
import MetadataForm from "@/components/upload/MetadataForm";
import ThumbnailSelector from "@/components/upload/ThumbnailSelector";
import PlatformConnections from "@/components/upload/PlatformConnections";
import UploadStatus from "@/components/upload/UploadStatus";

const Hero = () => {
  return (
    <div className="relative overflow-hidden py-16 md:py-24 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-autoreel-gray to-white dark:from-autoreel-dark dark:to-black z-0 opacity-50" />
      
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          <span className="gradient-text">Simplify</span> Your Video Uploads
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Upload once, publish everywhere. AutoReel Uploader helps you manage and
          distribute your short-form videos across TikTok, YouTube Shorts, and Facebook Reels.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="#upload-section">
            <Button className="button-gradient text-white px-8 py-6 text-lg rounded-full">
              Start Uploading
            </Button>
          </a>
        </div>
      </div>
      
      <div className="mt-16 max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Multi-Platform Uploads",
              description: "Upload your videos to TikTok, YouTube Shorts, and Facebook Reels simultaneously.",
              emoji: "🚀",
            },
            {
              title: "Custom Metadata",
              description: "Tailor your titles, descriptions, and tags for each platform's requirements.",
              emoji: "📝",
            },
            {
              title: "Progress Tracking",
              description: "Monitor upload status and receive notifications when processing is complete.",
              emoji: "📊",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-autoreel-dark/50 rounded-xl p-6 border border-border hover-scale"
            >
              <div className="mb-4 text-4xl">{feature.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("Untitled Video");
  const [activeTab, setActiveTab] = useState("upload");

  const handleVideoSelected = (file: File) => {
    setVideoFile(file);
    setVideoTitle(file.name.replace(/\.[^/.]+$/, "") || "Untitled Video");
  };

  const handleMetadataChange = (platform: any, metadata: any) => {
    // In a real app, we would store this metadata
    console.log(`Metadata updated for ${platform}:`, metadata);
    // Update title for all platforms if changed on current platform
    if (metadata.title) {
      setVideoTitle(metadata.title);
    }
  };

  const handleThumbnailSelected = (file: File | null, url: string | null) => {
    // In a real app, we would store this thumbnail
    console.log("Thumbnail selected:", { file, url });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        
        <div id="upload-section" className="max-w-7xl mx-auto px-4 py-8">
          <Tabs
            defaultValue="upload"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="publish">Publish</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-6">
              <VideoUploadCard onVideoSelected={handleVideoSelected} />
              {videoFile && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setActiveTab("configure")}
                    className="button-gradient text-white"
                  >
                    Continue to Configure
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="configure" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MetadataForm onMetadataChange={handleMetadataChange} />
                <ThumbnailSelector 
                  videoFile={videoFile} 
                  onThumbnailSelected={handleThumbnailSelected}
                />
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("upload")}
                >
                  Back to Upload
                </Button>
                <Button 
                  onClick={() => setActiveTab("publish")}
                  className="button-gradient text-white"
                >
                  Continue to Publish
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="publish" className="space-y-6">
              <PlatformConnections />
              <UploadStatus videoTitle={videoTitle} />
              <div className="flex justify-start">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("configure")}
                >
                  Back to Configure
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 AutoReel Uploader. All rights reserved.</p>
          <p className="mt-1">
            A tool for creators to simplify their social media workflow.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
