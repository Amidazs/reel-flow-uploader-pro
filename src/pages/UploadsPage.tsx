
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoUploader from "@/components/upload/VideoUploader";
import { useAuthContext } from "@/App";
import { useVideoHistory } from "@/hooks/useVideoHistory";
import { VideoHistoryList } from "@/components/upload/VideoHistoryList";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const UploadsPage = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("upload");
  const { uploads, loading, error, refetch } = useVideoHistory();
  
  // Effect to handle tab changes and refresh on upload tab change
  useEffect(() => {
    if (activeTab === "history") {
      refetch();
    }
  }, [activeTab, refetch]);
  
  const handleDeleteVideo = (deletedId: string) => {
    // No need to manually update state, we'll just refetch
    refetch();
  };

  const handleUploadComplete = () => {
    // Switch to history tab after upload completes
    setActiveTab("history");
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
                  loading={loading}
                  onDeleteVideo={handleDeleteVideo}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Uploads</CardTitle>
                <CardDescription>
                  Manage your scheduled content uploads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <svg
                      className="h-10 w-10 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No scheduled uploads</h3>
                  <p className="text-muted-foreground max-w-md">
                    Schedule your content for future release across multiple platforms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UploadsPage;
