import { supabase } from './supabase';

export class StorageService {
  private static readonly BUCKET_NAME = 'documents';

  static async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    // Simulate progress for demo
    if (onProgress) {
      const interval = setInterval(() => {
        const progress = Math.min(Math.random() * 100, 90);
        onProgress(progress);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        onProgress(100);
      }, 1000);
    }

    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        upsert: false
      });

    if (error) throw error;

    return data.path;
  }

  static async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;

    return data.signedUrl;
  }

  static async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path]);

    if (error) throw error;
  }

  static async listFiles(prefix: string) {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .list(prefix);

    if (error) throw error;

    return data;
  }

  static getFileUrl(path: string): string {
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${this.BUCKET_NAME}/${path}`;
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only PDF, JPEG, and PNG files are allowed' };
    }

    return { valid: true };
  }
}