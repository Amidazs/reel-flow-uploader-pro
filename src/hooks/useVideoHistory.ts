
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/App';
import { toast } from '@/components/ui/use-toast';

export type VideoUpload = {
  id: string;
  title: string;
  description: string | null;
  platform_id: string;
  video_url: string | null;
  file_name: string;
  uploaded_at: string;
  tags: string[] | null;
  scheduled_for?: string | null;
};

export const useVideoHistory = () => {
  const [uploads, setUploads] = useState<VideoUpload[]>([]);
  const [loading, setLoading] = useState(false); // Initialize as false instead of true
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthContext();

  const fetchUploads = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('Fetching video uploads for user:', user.id);
      
      const { data, error } = await supabase
        .from('video_uploads')
        .select('*')
        .eq('user_id', user.id)
        .is('scheduled_for', null) // Only fetch non-scheduled uploads
        .order('uploaded_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Video uploads fetched:', data);
      setUploads(data || []);
    } catch (err: any) {
      console.error('Error fetching video uploads:', err);
      setError(err);
      toast("Failed to load your upload history", {
        description: err.message || "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUploads();
    }
  }, [user, fetchUploads]);

  return {
    uploads,
    loading,
    error,
    refetch: fetchUploads
  };
};
