
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  LayoutList, 
  LayoutGrid, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle 
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

// Mock uploads for demonstration
const mockUploads = [
  {
    id: "1",
    title: "How to Make Pancakes - Quick Recipe",
    thumbnail: "https://picsum.photos/seed/pancakes/300/200",
    date: "2025-05-07",
    status: "completed",
    platforms: ["tiktok", "youtube", "facebook"],
    views: 2450
  },
  {
    id: "2",
    title: "Morning Routine for Productivity",
    thumbnail: "https://picsum.photos/seed/morning/300/200",
    date: "2025-05-05",
    status: "completed",
    platforms: ["youtube", "facebook"],
    views: 1890
  },
  {
    id: "3",
    title: "5 Tips for Better Sleep",
    thumbnail: "https://picsum.photos/seed/sleep/300/200",
    date: "2025-05-02",
    status: "completed",
    platforms: ["tiktok"],
    views: 3200
  },
  {
    id: "4",
    title: "Summer Fashion Trends 2025",
    thumbnail: "https://picsum.photos/seed/fashion/300/200",
    date: "2025-04-28",
    status: "processing",
    platforms: ["tiktok", "youtube"],
    views: 0
  },
  {
    id: "5",
    title: "DIY Home Decoration Ideas",
    thumbnail: "https://picsum.photos/seed/diy/300/200",
    date: "2025-04-25",
    status: "failed",
    platforms: ["facebook"],
    views: 0
  }
];

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const filteredUploads = mockUploads.filter(upload => {
    const matchesSearch = upload.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || upload.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNewUpload = () => {
    // In a real app, this would navigate to the upload page
    toast({
      title: "Upload feature",
      description: "Redirecting to upload page...",
    });
    window.location.href = "/";
  };

  const handleDeleteUpload = (id: string) => {
    toast({
      title: "Video deleted",
      description: "The video has been removed from your uploads.",
    });
    // In a real app, this would delete the upload
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
        
        {filteredUploads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No uploads found. Try adjusting your filters.</p>
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
                        {platformIcons[platform]}
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
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUpload(upload.id)}
                  >
                    Delete
                  </Button>
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
                            {platformIcons[platform]}
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
                  
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUpload(upload.id)}
                  >
                    Delete
                  </Button>
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
