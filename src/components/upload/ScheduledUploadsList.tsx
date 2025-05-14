
import { useState } from 'react';
import { VideoUpload } from '@/hooks/useVideoHistory';
import { formatDistance, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar, Share2, ExternalLink, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ScheduledUploadsListProps {
  uploads: VideoUpload[];
  loading: boolean;
  onDeleteScheduled: (id: string) => void;
}

export const ScheduledUploadsList = ({ uploads, loading, onDeleteScheduled }: ScheduledUploadsListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      
      const { error } = await supabase
        .from('video_uploads')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      onDeleteScheduled(id);
      toast("Scheduled upload canceled successfully", {
        description: "The scheduled upload has been removed"
      });
    } catch (error: any) {
      console.error('Error deleting scheduled upload:', error);
      toast("Failed to cancel scheduled upload", {
        description: error.message || "An error occurred while deleting the scheduled upload"
      });
    } finally {
      setDeletingId(null);
    }
  };
  
  const formatScheduledDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return {
        relativeTime: formatDistance(date, new Date(), { addSuffix: true }),
        formattedDate: format(date, 'PPP'),
        formattedTime: format(date, 'p')
      };
    } catch (e) {
      return {
        relativeTime: 'Unknown',
        formattedDate: 'Unknown date',
        formattedTime: 'Unknown time'
      };
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
          <Calendar
            className="h-10 w-10 text-muted-foreground"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2">No scheduled uploads</h3>
        <p className="text-muted-foreground max-w-md">
          You don't have any scheduled uploads at the moment. Schedule content for future release on the upload page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {uploads.map((upload) => {
        const platform = getPlatformDisplay(upload.platform_id);
        const scheduledInfo = upload.scheduled_for ? formatScheduledDate(upload.scheduled_for) : null;
        const isPastScheduled = upload.scheduled_for && new Date(upload.scheduled_for) < new Date();
          
        return (
          <div 
            key={upload.id} 
            className={`flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg p-4 gap-4 ${isPastScheduled ? 'border-amber-300 bg-amber-50' : ''}`}
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
                
                {scheduledInfo && (
                  <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isPastScheduled ? 'bg-amber-200 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {isPastScheduled ? (
                        <span className="flex items-center">
                          <AlertTriangle size={10} className="mr-1" /> Pending
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Calendar size={10} className="mr-1" /> Scheduled
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock size={10} className="mr-1" /> 
                      {scheduledInfo.formattedDate} at {scheduledInfo.formattedTime} ({scheduledInfo.relativeTime})
                    </span>
                  </div>
                )}
                
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
                    {platform.name}
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
                    <AlertDialogTitle>Cancel this scheduled upload?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel the scheduled upload and remove it from your schedule. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep scheduled</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDelete(upload.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deletingId === upload.id ? 'Canceling...' : 'Cancel upload'}
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
