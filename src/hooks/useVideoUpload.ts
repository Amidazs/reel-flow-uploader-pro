
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type UploadOptions = {
  userId?: string;
  platform?: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
  onProgress?: (progress: number) => void;
  onComplete?: (url: string) => void;
  onError?: (error: Error) => void;
};

export default function useVideoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const uploadVideo = async (file: File, options?: UploadOptions) => {
    if (!file) {
      const err = new Error('No file selected');
      setError(err);
      options?.onError?.(err);
      return { error: err };
    }

    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);
      setVideoUrl(null);
      
      // Set regular progress updates using an interval
      let progressCount = 0;
      const progressInterval = setInterval(() => {
        progressCount += 5;
        if (progressCount >= 90) {
          clearInterval(progressInterval);
          setProgress(90);
        } else {
          setProgress(progressCount);
        }
        
        if (options?.onProgress) {
          options.onProgress(progressCount);
        }
      }, 300);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const userId = options?.userId || 'anonymous';
      const filePath = `${userId}/${fileName}`;

      console.log(`Uploading file to path: ${filePath}`);
      
      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      // Clear progress interval regardless of outcome
      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      console.log('Upload successful:', data);
      setProgress(95);

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const videoUrl = publicUrlData?.publicUrl || '';
      setVideoUrl(videoUrl);
      
      // Save to database
      const { error: dbError } = await supabase
        .from('video_uploads')
        .insert({
          user_id: options?.userId || null,
          file_name: fileName,
          platform_id: options?.platform || 'local',
          title: options?.metadata?.title || file.name,
          description: options?.metadata?.description || '',
          tags: options?.metadata?.tags || [],
          video_url: videoUrl,
          uploaded_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error('Error saving video metadata to database:', dbError);
        // We still continue since the file upload was successful
        toast.error('Video uploaded but metadata could not be saved.');
      }

      setProgress(100);
      toast.success('Video uploaded successfully!');
      
      if (options?.onComplete) {
        options.onComplete(videoUrl);
      }

      return { url: videoUrl, error: null };
    } catch (err: any) {
      console.error('Error uploading video:', err);
      setError(err);
      toast.error(`Upload failed: ${err.message || 'Unknown error'}`);
      options?.onError?.(err);
      return { url: null, error: err };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadVideo,
    isUploading,
    progress,
    error,
    videoUrl
  };
}
