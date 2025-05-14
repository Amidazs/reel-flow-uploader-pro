
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoUploader from "@/components/upload/VideoUploader";
import { useAuthContext } from "@/App";
import { useVideoHistory } from "@/hooks/useVideoHistory";
import { useScheduledUploads } from "@/hooks/useScheduledUploads";
import { VideoHistoryList } from "@/components/upload/VideoHistoryList";
import { ScheduledUploadsList } from "@/components/upload/ScheduledUploadsList";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const UploadsPage = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("upload");
  const { uploads, loading: uploadsLoading, error, refetch } = useVideoHistory();
  const { scheduledUploads, loading: scheduledLoading, refetch: refetchScheduled } = useScheduledUploads();
  
  // Effect to handle tab changes and refresh on tab change
  useEffect(() => {
    if (activeTab === "history") {
      refetch();
    } else if (activeTab === "scheduled") {
      refetchScheduled();
    }
  }, [activeTab, refetch, refetchScheduled]);
  
  const handleDeleteVideo = (deletedId: string) => {
    // No need to manually update state, we'll just refetch
    refetch();
  };

  const handleDeleteScheduled = (deletedId: string) => {
    // No need to manually update state, we'll just refetch
    refetchScheduled();
  };

  const handleUploadComplete = () => {
    // Switch to history tab after upload completes
    setActiveTab("history");
    toast({
      title: "Upload complete",
      description: "Your video has been successfully uploaded"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Upload & Manage Content</h1>
        
        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="history">Upload History</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Content</CardTitle>
                <CardDescription>
                  Upload videos to multiple platforms with a single click
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VideoUploader onUploadComplete={handleUploadComplete} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upload History</CardTitle>
                  <CardDescription>
                    View and manage your previously uploaded content
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refetch} 
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <VideoHistoryList 
                  uploads={uploads}
                  loading={uploadsLoading}
                  onDeleteVideo={handleDeleteVideo}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scheduled">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Scheduled Uploads</CardTitle>
                  <CardDescription>
                    Manage your scheduled content uploads
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refetchScheduled} 
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <ScheduledUploadsList
                  uploads={scheduledUploads}
                  loading={scheduledLoading}
                  onDeleteScheduled={handleDeleteScheduled}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UploadsPage;
