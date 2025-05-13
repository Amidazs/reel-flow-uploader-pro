
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
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

      // Check if we have storage buckets available
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketError) {
        throw new Error('Storage buckets not available. Videos cannot be uploaded at this time.');
      }

      const hasBucket = buckets?.some(bucket => bucket.name === 'videos');
      if (!hasBucket) {
        throw new Error('Videos storage bucket not found. Please contact support.');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${options?.userId || 'anonymous'}/${fileName}`;

      console.log(`Uploading file to path: ${filePath}`);

      // Create an AbortController to track progress manually
      const abortController = new AbortController();
      
      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          // Using a custom progress handler separately since onUploadProgress is not in FileOptions
        });

      // Handle progress tracking separately using events if needed
      // This is a workaround since onUploadProgress is not available in FileOptions
      // We can use the progress state from the useState hook
      
      if (uploadError) {
        throw uploadError;
      }

      console.log('Upload successful:', data);

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const videoUrl = publicUrlData?.publicUrl || '';
      setVideoUrl(videoUrl);

      // If user is logged in and we have platform info, save to database
      if (options?.userId) {
        const { error: dbError } = await supabase
          .from('video_uploads')
          .insert({
            user_id: options.userId,
            file_name: fileName,
            platform_id: options.platform || 'local',
            title: options.metadata?.title || file.name,
            description: options.metadata?.description || '',
            tags: options.metadata?.tags || [],
            video_url: videoUrl,
          });

        if (dbError) {
          console.error('Error saving video metadata to database:', dbError);
          toast.error('Video uploaded but metadata could not be saved.');
        }
      }

      toast.success('Video uploaded successfully!');
      
      if (options?.onComplete) {
        options.onComplete(videoUrl);
      }

      return { url: videoUrl, error: null };
    } catch (err) {
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
