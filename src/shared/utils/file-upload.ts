// File upload utilities and API service
import { apiClient } from '@/shared/utils/api-client';
import { ROUTES, FILE_CONFIG } from '@/shared/constants';

export interface UploadedFile {
  id?: string;
  filename: string;
  originalName: string;
  url: string;
  originalUrl?: string | null;
  size: number;
  originalSize?: number;
  type: string;
  originalType?: string;
  folder: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    [key: string]: unknown;
  };
  createdAt?: string;
  userId?: string;
}

export enum FileCategory {
  AVATAR = 'AVATAR',
  SERVICE_IMAGE = 'SERVICE_IMAGE',
  MESSAGE_ATTACHMENT = 'MESSAGE_ATTACHMENT',
  DOCUMENT = 'DOCUMENT',
  CERTIFICATE = 'CERTIFICATE',
  GALLERY = 'GALLERY',
  OTHER = 'OTHER',
}

export interface MultiUploadResult {
  uploaded: UploadedFile[];
  errors: {
    index: number;
    filename: string;
    error: string;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface UploadOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  folder?: string;
  category?: FileCategory;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// File validation utilities
export const FILE_CONSTRAINTS = {
  [FileCategory.AVATAR]: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    resize: { width: 300, height: 300, quality: 0.8 },
    folder: 'avatars',
  },
  [FileCategory.SERVICE_IMAGE]: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    resize: { width: 800, height: 600, quality: 0.85 },
    folder: 'services',
  },
  [FileCategory.MESSAGE_ATTACHMENT]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    folder: 'messages',
  },
  [FileCategory.DOCUMENT]: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    folder: 'documents',
  },
  [FileCategory.CERTIFICATE]: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    folder: 'certificates',
  },
  [FileCategory.GALLERY]: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    resize: { width: 1200, height: 800, quality: 0.85 },
    folder: 'gallery',
  },  [FileCategory.OTHER]: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [...FILE_CONFIG.allowedImageTypes, ...FILE_CONFIG.allowedFileTypes] as string[],
    folder: 'others',
  },
} as const;

export function validateFile(file: File, category?: FileCategory): ValidationResult {
  try {
    // Basic file size check
    if (file.size > FILE_CONFIG.maxFileSize) {
      const maxSizeMB = FILE_CONFIG.maxFileSize / (1024 * 1024);
      return {
        isValid: false,
        error: `El archivo excede el tamaño máximo permitido de ${maxSizeMB}MB`,
      };
    }
    
    // Check if it's an allowed file type
    const isImage = (FILE_CONFIG.allowedImageTypes as readonly string[]).includes(file.type);
    const isDocument = (FILE_CONFIG.allowedFileTypes as readonly string[]).includes(file.type);
    
    if (!isImage && !isDocument) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido.`,
      };
    }
    
    // If category is specified, do more specific checks
    if (category) {
      const constraints = FILE_CONSTRAINTS[category];
      
      // Check category-specific file size
      if (file.size > constraints.maxSize) {
        const maxSizeMB = constraints.maxSize / (1024 * 1024);
        return {
          isValid: false,
          error: `El archivo excede el tamaño máximo permitido de ${maxSizeMB}MB para ${category}`,
        };
      }
      
      // Check category-specific file type
      if (!(constraints.allowedTypes as string[]).includes(file.type)) {
        return {
          isValid: false,
          error: `Tipo de archivo no permitido para ${category}`,
        };
      }
    }
    
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Error al validar el archivo',
    };
  }
}

// Helper functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  return '📎';
}

// Returns the appropriate folder based on category
export function getFolderByCategory(category: FileCategory): string {
  const constraints = FILE_CONSTRAINTS[category];
  return constraints.folder;
}

// Check if file is an image
export function isImageFile(file: File): boolean {
  return (FILE_CONFIG.allowedImageTypes as readonly string[]).includes(file.type);
}

// Check if file is a document
export function isDocumentFile(file: File): boolean {
  return (FILE_CONFIG.allowedFileTypes as readonly string[]).includes(file.type);
}

// Image resize utility (client-side)
export function resizeImage(
  file: File,
  width: number,
  height: number,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      
      // Calculate aspect ratio
      const aspectRatio = img.width / img.height;
      const targetAspectRatio = width / height;
      
      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;
      
      if (aspectRatio > targetAspectRatio) {
        // Image is wider than target
        drawWidth = height * aspectRatio;
        offsetX = (width - drawWidth) / 2;
      } else {
        // Image is taller than target
        drawHeight = width / aspectRatio;
        offsetY = (height - drawHeight) / 2;
      }
      
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          'image/jpeg',
          quality
        );
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

class FileUploadService {
  // Single file upload with progress tracking
  async uploadFile(
    file: File,
    category?: FileCategory,
    onProgress?: (progress: UploadProgress) => void,
    options: UploadOptions = {}
  ): Promise<UploadedFile> {
    // Validate file first
    const validation = validateFile(file, category);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Archivo inválido');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Add folder based on category or options
    if (category) {
      options.folder = options.folder || getFolderByCategory(category);
    }
    
    // Add options to form data
    if (options.folder) formData.append('folder', options.folder);
    if (options.quality) formData.append('quality', options.quality.toString());
    if (options.maxWidth) formData.append('maxWidth', options.maxWidth.toString());
    if (options.maxHeight) formData.append('maxHeight', options.maxHeight.toString());
    
    // Upload with progress tracking using XMLHttpRequest for better control
    return new Promise<UploadedFile>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          onProgress(progress);
        }
      });
      
      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.data) {
              resolve(response.data);
            } else {
              reject(new Error(response.message || 'Error desconocido'));
            }
          } catch {
            reject(new Error('Error al procesar la respuesta del servidor'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Error ${xhr.status}`));
          } catch {
            reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
          }
        }
      });
      
      // Handle network errors
      xhr.addEventListener('error', () => {
        reject(new Error('Error de red al subir archivo'));
      });
      
      // Handle aborted uploads
      xhr.addEventListener('abort', () => {
        reject(new Error('Subida cancelada'));
      });
      
      // Set up and send the request
      xhr.open('POST', `${ROUTES.api.upload}`);
      xhr.withCredentials = true; // send cookies for session-based auth

      // Add authentication if available (token-based fallback)
      const token =
        typeof window !== 'undefined' &&
        typeof localStorage === 'object' &&
        typeof localStorage.getItem === 'function'
          ? localStorage.getItem('auth-token')
          : null;
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('x-better-auth-token', token);
      }
      
      xhr.send(formData);
    });
  }
  
  // Multiple files upload with progress tracking
  async uploadFiles(
    files: File[],
    category?: FileCategory,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
    options: UploadOptions = {}
  ): Promise<UploadedFile[]> {
    // For single file uploads or empty arrays, use the single upload method or return empty array
    if (files.length <= 0) {
      return [];
    }
    if (files.length === 1) {
      const file = await this.uploadFile(
        files[0], 
        category,
        progress => onProgress && onProgress(0, progress),
        options
      );
      return [file];
    }
    
    // For multiple files, use the batch upload endpoint
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add options to form data
    if (category) {
      options.folder = options.folder || getFolderByCategory(category);
    }
    
    if (options.folder) formData.append('folder', options.folder);
    if (options.quality) formData.append('quality', options.quality.toString());
    if (options.maxWidth) formData.append('maxWidth', options.maxWidth.toString());
    if (options.maxHeight) formData.append('maxHeight', options.maxHeight.toString());
    
    // Upload with progress tracking using XMLHttpRequest
    return new Promise<UploadedFile[]>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          
          // Report the same progress to all files since we can't track them individually
          files.forEach((_, index) => {
            onProgress(index, progress);
          });
        }
      });
      
      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.data) {
              const result = response.data as MultiUploadResult;
              
              // Log any errors that occurred
              if (result.errors && result.errors.length > 0) {
                console.warn('Some files failed to upload:', result.errors);
              }
              
              resolve(result.uploaded);
            } else {
              reject(new Error(response.message || 'Error desconocido'));
            }
          } catch {
            reject(new Error('Error al procesar la respuesta del servidor'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Error ${xhr.status}`));
          } catch {
            reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
          }
        }
      });
      
      // Handle network errors
      xhr.addEventListener('error', () => {
        reject(new Error('Error de red al subir archivos'));
      });
      
      // Handle aborted uploads
      xhr.addEventListener('abort', () => {
        reject(new Error('Subida cancelada'));
      });
      
      // Set up and send the request
      xhr.open('POST', `${ROUTES.api.uploadMultiple}`);
      xhr.withCredentials = true; // send cookies for session-based auth

      // Add authentication if available (token-based fallback)
      const token =
        typeof window !== 'undefined' &&
        typeof localStorage === 'object' &&
        typeof localStorage.getItem === 'function'
          ? localStorage.getItem('auth-token')
          : null;
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('x-better-auth-token', token);
      }
      
      xhr.send(formData);
    });
  }
  
  // Delete file by filename and optional folder
  async deleteFile(filename: string, folder?: string): Promise<void> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('filename', filename);
      if (folder) queryParams.append('folder', folder);
      
      await apiClient.delete(`${ROUTES.api.upload}?${queryParams.toString()}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Error al eliminar el archivo');
    }
  }
  
  // Get file info (placeholder for future API endpoint)
  async getFileInfo(fileId: string): Promise<UploadedFile> {
    try {
      // This assumes an endpoint like /api/upload/info/{id} will be created
      const response = await apiClient.get(`${ROUTES.api.upload}/info/${fileId}`);
      return response.data as UploadedFile;
    } catch (error) {
      console.error('Error fetching file info:', error);
      throw new Error('Error al obtener información del archivo');
    }
  }
  
  // Get user's uploaded files (placeholder for future API endpoint)
  async getUserFiles(category?: FileCategory): Promise<UploadedFile[]> {
    try {
      const queryParams = new URLSearchParams();
      if (category) queryParams.append('category', category);
        // This assumes an endpoint like /api/upload/user will be created
      const response = await apiClient.get(`${ROUTES.api.upload}/user?${queryParams.toString()}`);
      return response.data as UploadedFile[];
    } catch (error) {
      console.error('Error fetching user files:', error);
      return [];
    }
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
export default fileUploadService;
