import { defineStore } from 'pinia'
import { v4 } from 'uuid'

export interface StorageOptions {
  onSuccess?: (publicUrl: string, fileName: string) => Promise<void> | void
  onError?: (error: Error) => void
}

export interface EditImageOptions extends StorageOptions {
  deleteOldFile?: boolean
}

export interface DeleteImageOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const useStorageStore = defineStore('storage', {
  state: () => ({
    uploading: false,
    deleting: false
  }),
  
  actions: {
    /**
     * Upload a new image to Supabase storage
     * @param bucket - The storage bucket name (e.g., 'business_images', 'menu_images', 'merchant_avatars')
     * @param file - The file to upload
     * @param options - Optional callbacks for success/error handling
     * @returns Object with publicUrl and fileName, or null if error
     */
    async addImage(
      bucket: string,
      file: File,
      options?: StorageOptions
    ): Promise<{ publicUrl: string; fileName: string } | null> {
      this.uploading = true
      
      try {
        const supabase = useSupabaseClient()
        
        // Generate unique filename with UUID
        const fileExt = file.name.split('.').pop()
        const fileName = `${v4()}.${fileExt}`
        const filePath = fileName

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file)

        if (uploadError) {
          const error = new Error(uploadError.message)
          if (options?.onError) {
            options.onError(error)
          }
          throw error
        }

        // Get public URL
        const { data } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        if (!data) {
          const error = new Error('Failed to get public URL')
          if (options?.onError) {
            options.onError(error)
          }
          throw error
        }

        const publicUrl = data.publicUrl

        // Call success callback if provided
        if (options?.onSuccess) {
          await options.onSuccess(publicUrl, fileName)
        }

        return { publicUrl, fileName }
      } catch (error: any) {
        console.error('Error uploading image:', error)
        if (options?.onError && !(error instanceof Error && error.message.includes('onError'))) {
          options.onError(error instanceof Error ? error : new Error(error.message || 'Upload failed'))
        }
        return null
      } finally {
        this.uploading = false
      }
    },

    /**
     * Edit/replace an existing image in Supabase storage
     * Optionally deletes the old file if oldFileName is provided
     * @param bucket - The storage bucket name
     * @param file - The new file to upload
     * @param oldFileName - Optional filename of the old file to delete
     * @param options - Optional callbacks and settings
     * @returns Object with publicUrl and fileName, or null if error
     */
    async editImage(
      bucket: string,
      file: File,
      oldFileName?: string | null,
      options?: EditImageOptions
    ): Promise<{ publicUrl: string; fileName: string } | null> {
      this.uploading = true
      
      try {
        const supabase = useSupabaseClient()
        
        // Generate unique filename with UUID
        const fileExt = file.name.split('.').pop()
        const fileName = `${v4()}.${fileExt}`
        const filePath = fileName

        // Upload new file to storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file)

        if (uploadError) {
          const error = new Error(uploadError.message)
          if (options?.onError) {
            options.onError(error)
          }
          throw error
        }

        // Get public URL
        const { data } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        if (!data) {
          const error = new Error('Failed to get public URL')
          if (options?.onError) {
            options.onError(error)
          }
          throw error
        }

        const publicUrl = data.publicUrl

        // Call success callback if provided (before deleting old file)
        if (options?.onSuccess) {
          await options.onSuccess(publicUrl, fileName)
        }

        // Delete old file if provided and deleteOldFile is not explicitly false
        const shouldDeleteOld = oldFileName && (options?.deleteOldFile !== false)
        if (shouldDeleteOld) {
          try {
            const { error: deleteError } = await supabase.storage
              .from(bucket)
              .remove([oldFileName])

            if (deleteError) {
              console.warn('Error deleting old file:', deleteError.message)
              // Don't throw - old file deletion failure shouldn't break the edit
            }
          } catch (deleteErr: any) {
            console.error('Error deleting old file:', deleteErr)
            // Don't throw - old file deletion failure shouldn't break the edit
          }
        }

        return { publicUrl, fileName }
      } catch (error: any) {
        console.error('Error editing image:', error)
        if (options?.onError && !(error instanceof Error && error.message.includes('onError'))) {
          options.onError(error instanceof Error ? error : new Error(error.message || 'Edit failed'))
        }
        return null
      } finally {
        this.uploading = false
      }
    },

    /**
     * Delete an image from Supabase storage
     * @param bucket - The storage bucket name
     * @param fileName - The filename to delete
     * @param options - Optional callbacks for success/error handling
     * @returns true if successful, false otherwise
     */
    async deleteImage(
      bucket: string,
      fileName: string,
      options?: DeleteImageOptions
    ): Promise<boolean> {
      if (!fileName) {
        console.warn('No filename provided for deletion')
        return false
      }

      this.deleting = true
      
      try {
        const supabase = useSupabaseClient()
        
        const { error } = await supabase.storage
          .from(bucket)
          .remove([fileName])

        if (error) {
          const err = new Error(error.message)
          if (options?.onError) {
            options.onError(err)
          } else {
            console.warn('Image deletion failed:', error.message)
          }
          return false
        }

        // Call success callback if provided
        if (options?.onSuccess) {
          options.onSuccess()
        }

        return true
      } catch (error: any) {
        console.error('Error deleting image:', error)
        if (options?.onError) {
          options.onError(error instanceof Error ? error : new Error(error.message || 'Delete failed'))
        }
        return false
      } finally {
        this.deleting = false
      }
    }
  }
})
