// React hooks for file upload functionality
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fileUploadService,
  FileCategory,
  UploadedFile,
  UploadProgress,
  validateFile,
} from '@/shared/utils/file-upload';

// Re-export FileCategory so it can be imported from this module
export { FileCategory } from '@/shared/utils/file-upload';

// Query Keys
export const FILE_UPLOAD_QUERY_KEYS = {
  all: ['files'] as const,
  userFiles: (category?: FileCategory) => [...FILE_UPLOAD_QUERY_KEYS.all, 'user', category] as const,
  fileInfo: (id: string) => [...FILE_UPLOAD_QUERY_KEYS.all, 'info', id] as const,
} as const;

// File upload state interface
export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: UploadedFile | null;
}

// Single file upload hook
export function useFileUpload(category: FileCategory) {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFile: null,
  });

  const queryClient = useQueryClient();

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile> => {
      // Validate file first
      const validation = validateFile(file, category);
      if (!validation.isValid) {
        const error = validation.error || 'Invalid file';
        setUploadState(prev => ({ ...prev, error }));
        toast.error(error);
        throw new Error(error);
      }

      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        uploadedFile: null,
      });

      try {
        const uploadedFile = await fileUploadService.uploadFile(
          file,
          category,
          (progress: UploadProgress) => {
            setUploadState(prev => ({
              ...prev,
              progress: progress.percentage,
            }));
          }
        );

        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 100,
          uploadedFile,
        }));

        // Invalidate user files cache
        queryClient.invalidateQueries({
          queryKey: FILE_UPLOAD_QUERY_KEYS.userFiles(category),
        });

        toast.success('Archivo subido exitosamente');
        return uploadedFile;      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al subir archivo';
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));
        toast.error(errorMessage);
        throw error;
      }
    },
    [category, queryClient]
  );

  const resetState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFile: null,
    });
  }, []);

  return {
    uploadFile,
    resetState,
    ...uploadState,
  };
}

// Multiple files upload hook
export function useMultipleFileUpload(category: FileCategory) {
  const [uploadStates, setUploadStates] = useState<Record<string, FileUploadState>>({});
  const queryClient = useQueryClient();

  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadedFile[]> => {
      // Initialize states for all files
      const initialStates: Record<string, FileUploadState> = {};
      files.forEach((file, index) => {
        initialStates[`file-${index}`] = {
          isUploading: true,
          progress: 0,
          error: null,
          uploadedFile: null,
        };
      });
      setUploadStates(initialStates);

      try {
        const uploadedFiles = await fileUploadService.uploadFiles(
          files,
          category,
          (fileIndex: number, progress: UploadProgress) => {
            setUploadStates(prev => ({
              ...prev,
              [`file-${fileIndex}`]: {
                ...prev[`file-${fileIndex}`],
                progress: progress.percentage,
              },
            }));
          }
        );

        // Update states with successful uploads
        uploadedFiles.forEach((uploadedFile, index) => {
          setUploadStates(prev => ({
            ...prev,
            [`file-${index}`]: {
              ...prev[`file-${index}`],
              isUploading: false,
              progress: 100,
              uploadedFile,
            },
          }));
        });

        // Invalidate user files cache
        queryClient.invalidateQueries({
          queryKey: FILE_UPLOAD_QUERY_KEYS.userFiles(category),
        });

        toast.success(`${uploadedFiles.length} archivos subidos exitosamente`);
        return uploadedFiles;      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al subir archivos';
        
        // Mark all as failed
        setUploadStates(prev => {
          const newStates = { ...prev };
          Object.keys(newStates).forEach(key => {
            if (newStates[key].isUploading) {
              newStates[key] = {
                ...newStates[key],
                isUploading: false,
                error: errorMessage,
              };
            }
          });
          return newStates;
        });

        toast.error(errorMessage);
        throw error;
      }
    },
    [category, queryClient]
  );

  const resetStates = useCallback(() => {
    setUploadStates({});
  }, []);

  const getFileState = useCallback((fileIndex: number): FileUploadState => {
    return uploadStates[`file-${fileIndex}`] || {
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFile: null,
    };
  }, [uploadStates]);

  return {
    uploadFiles,
    resetStates,
    getFileState,
    allStates: uploadStates,
  };
}

// Query hooks
export function useUserFiles(category?: FileCategory) {
  return useQuery({
    queryKey: FILE_UPLOAD_QUERY_KEYS.userFiles(category),
    queryFn: () => fileUploadService.getUserFiles(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFileInfo(fileId: string) {
  return useQuery({
    queryKey: FILE_UPLOAD_QUERY_KEYS.fileInfo(fileId),
    queryFn: () => fileUploadService.getFileInfo(fileId),
    enabled: Boolean(fileId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Mutation hooks
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => fileUploadService.deleteFile(fileId),
    onSuccess: () => {
      // Invalidate all file-related queries
      queryClient.invalidateQueries({
        queryKey: FILE_UPLOAD_QUERY_KEYS.all,
      });
      toast.success('Archivo eliminado exitosamente');
    },    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar archivo';
      toast.error(errorMessage);
    },
  });
}

// Drag and drop hook
export function useDragAndDrop(
  onFilesDropped: (files: File[]) => void,
  acceptedTypes?: string[]
) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      
      // Filter by accepted types if specified
      const filteredFiles = acceptedTypes
        ? files.filter(file => acceptedTypes.includes(file.type))
        : files;

      if (filteredFiles.length > 0) {
        onFilesDropped(filteredFiles);
      } else if (acceptedTypes && files.length > 0) {
        toast.error('Tipo de archivo no permitido');
      }
    },
    [onFilesDropped, acceptedTypes]
  );

  return {
    isDragOver,
    dragProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
