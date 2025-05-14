
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/App';
import { toast } from '@/components/ui/use-toast';
import { VideoUpload } from './useVideoHistory';

export const useScheduledUploads = () => {
  const [scheduledUploads, setScheduledUploads] = useState<VideoUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthContext();

  const fetchScheduledUploads = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('Fetching scheduled uploads for user:', user.id);
      
      const { data, error } = await supabase
        .from('video_uploads')
        .select('*')
        .eq('user_id', user.id)
        .not('scheduled_for', 'is', null) // Only fetch scheduled uploads
        .order('scheduled_for', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      console.log('Scheduled uploads fetched:', data);
      setScheduledUploads(data || []);
    } catch (err: any) {
      console.error('Error fetching scheduled uploads:', err);
      setError(err);
      toast("Failed to load your scheduled uploads", {
        description: err.message || "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchScheduledUploads();
    }
  }, [user, fetchScheduledUploads]);

  return {
    scheduledUploads,
    loading,
    error,
    refetch: fetchScheduledUploads
  };
};
