
import { VideoUpload } from '@/hooks/useVideoHistory';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Share2, ExternalLink, Trash2, Clock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';

interface VideoHistoryListProps {
  uploads: VideoUpload[];
  loading: boolean;
  onDeleteVideo: (id: string) => void;
}

export const VideoHistoryList = ({ uploads, loading, onDeleteVideo }: VideoHistoryListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      
      const { error } = await supabase
        .from('video_uploads')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      onDeleteVideo(id);
      toast("Video deleted successfully", {
        description: "The video has been removed from your history"
      });
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast("Failed to delete video", {
        description: error.message || "An error occurred while deleting the video"
      });
    } finally {
      setDeletingId(null);
    }
  };
  
  const getPlatformDisplay = (platformId: string) => {
    switch(platformId) {
      case 'google': return { name: 'YouTube', bg: 'bg-red-50', icon: '📺' };
      case 'facebook': return { name: 'Facebook', bg: 'bg-blue-50', icon: '👥' };
      case 'local': return { name: 'Local', bg: 'bg-gray-50', icon: '💾' };
      default: return { name: platformId, bg: 'bg-gray-50', icon: '📁' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!uploads.length) {
    return (
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
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">No uploads yet</h3>
        <p className="text-muted-foreground max-w-md">
          Your uploaded videos will appear here. Start uploading content to build your history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {uploads.map((upload) => {
        const platform = getPlatformDisplay(upload.platform_id);
        const uploadDate = upload.uploaded_at 
          ? formatDistanceToNow(new Date(upload.uploaded_at), { addSuffix: true }) 
          : 'Unknown date';
          
        return (
          <div 
            key={upload.id} 
            className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg p-4 gap-4"
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 ${platform.bg} rounded-md flex items-center justify-center text-xl`}>
                {platform.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium truncate">{upload.title}</h4>
                {upload.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {upload.description}
                  </p>
                )}
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
                    {platform.name}
                  </span>
                  <span className="ml-2 flex items-center">
                    <Clock size={12} className="mr-1" /> {uploadDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              {upload.video_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(upload.video_url!, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              )}
              
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this video?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the video record from your history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDelete(upload.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deletingId === upload.id ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        );
      })}
    </div>
  );
};
