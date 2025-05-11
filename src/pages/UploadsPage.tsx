
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  LayoutList, 
  LayoutGrid, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthContext } from "@/App";
import { supabase } from "@/lib/supabase";

type VideoUpload = {
  id: string;
  title: string;
  thumbnail?: string;
  date: string;
  status: "completed" | "processing" | "failed";
  platforms: string[];
  views: number;
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "completed":
      return <CheckCircle size={16} className="text-green-500" />;
    case "processing":
      return <Clock size={16} className="text-amber-500" />;
    case "failed":
      return <AlertCircle size={16} className="text-red-500" />;
    default:
      return null;
  }
};

const UploadsPage = () => {
  const { user } = useAuthContext();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploads, setUploads] = useState<VideoUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch uploads from Supabase
  useEffect(() => {
    const fetchUploads = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('video_uploads')
          .select('*')
          .eq('user_id', user.id)
          .order('uploaded_at', { ascending: false });

        if (error) throw error;

        // Process the data into our format
        const formattedUploads: VideoUpload[] = (data || []).map(upload => {
          // Generate a random number for views for demo purposes
          // In a real app, this would come from analytics data
          const randomViews = Math.floor(Math.random() * 5000);
          
          // Ensure the status is one of the allowed values
          let uploadStatus: "completed" | "processing" | "failed";
          
          if (upload.video_url) {
            uploadStatus = "completed";
          } else if (upload.platform_id === "failed") {
            uploadStatus = "failed";
          } else {
            uploadStatus = "processing";
          }
          
          return {
            id: upload.id,
            title: upload.title,
            thumbnail: `https://picsum.photos/seed/${upload.id}/300/200`, // Placeholder image
            date: new Date(upload.uploaded_at || new Date()).toISOString().split('T')[0],
            status: uploadStatus,
            platforms: [upload.platform_id],
            views: randomViews
          };
        });

        setUploads(formattedUploads);
      } catch (error) {
        console.error("Error fetching uploads:", error);
        toast({
          title: "Failed to load uploads",
          description: "There was a problem retrieving your uploads",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUploads();
  }, [user, toast]);

  const filteredUploads = uploads.filter(upload => {
    const matchesSearch = upload.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || upload.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNewUpload = () => {
    toast({
      title: "Upload feature",
      description: "Redirecting to upload page...",
    });
    window.location.href = "/";
  };

  const handleDeleteUpload = async (id: string) => {
    try {
      const { error } = await supabase
        .from('video_uploads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update state to remove the deleted upload
      setUploads(prevUploads => prevUploads.filter(upload => upload.id !== id));
      
      toast({
        title: "Video deleted",
        description: "The video has been removed from your uploads.",
      });
    } catch (error) {
      console.error("Error deleting upload:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the video. Please try again.",
        variant: "destructive"
      });
    }
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "processing", label: "Processing" },
    { value: "failed", label: "Failed" }
  ];

  const platformIcons: Record<string, string> = {
    tiktok: "🎵",
    youtube: "📺",
    facebook: "👥"
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Your Uploads</h1>
          
          <Button 
            onClick={handleNewUpload} 
            className="button-gradient text-white"
          >
            <Upload size={18} className="mr-1" />
            New Upload
          </Button>
        </div>
        
        <div className="bg-card border rounded-lg shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search uploads..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-grow">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end">
              <div className="bg-muted rounded-md flex">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <LayoutGrid size={18} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <LayoutList size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 size={36} className="animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your uploads...</p>
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {uploads.length === 0
                ? "You haven't uploaded any videos yet."
                : "No uploads found. Try adjusting your filters."}
            </p>
            {uploads.length === 0 && (
              <Button 
                onClick={handleNewUpload} 
                variant="outline" 
                className="mt-4"
              >
                <Upload size={16} className="mr-2" />
                Upload Your First Video
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUploads.map(upload => (
              <Card key={upload.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video relative">
                  <img 
                    src={upload.thumbnail} 
                    alt={upload.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {upload.platforms.map(platform => (
                      <span 
                        key={platform} 
                        className="w-6 h-6 flex items-center justify-center bg-black/70 rounded-full text-xs"
                        title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                      >
                        {platformIcons[platform] || "📱"}
                      </span>
                    ))}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <StatusIcon status={upload.status} />
                      <span className="ml-1 text-sm capitalize">{upload.status}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{upload.date}</span>
                  </div>
                  <h3 className="font-medium line-clamp-2 mb-2">{upload.title}</h3>
                  {upload.status === "completed" && (
                    <div className="text-sm text-muted-foreground">
                      {upload.views.toLocaleString()} views
                    </div>
                  )}
                </CardContent>
                <div className="px-4 pb-4 pt-0 flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this video from your uploads.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUpload(upload.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUploads.map(upload => (
              <Card key={upload.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-24 h-16 md:w-36 md:h-20 flex-shrink-0 rounded overflow-hidden">
                    <img 
                      src={upload.thumbnail} 
                      alt={upload.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusIcon status={upload.status} />
                      <span className="text-sm capitalize">{upload.status}</span>
                      <span className="text-xs text-muted-foreground">• {upload.date}</span>
                    </div>
                    <h3 className="font-medium line-clamp-1">{upload.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1">
                        {upload.platforms.map(platform => (
                          <span 
                            key={platform} 
                            className="flex items-center justify-center text-xs"
                            title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                          >
                            {platformIcons[platform] || "📱"}
                          </span>
                        ))}
                      </div>
                      {upload.status === "completed" && (
                        <span className="text-sm text-muted-foreground">
                          • {upload.views.toLocaleString()} views
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this video from your uploads.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUpload(upload.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 AutoReel Uploader. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default UploadsPage;
