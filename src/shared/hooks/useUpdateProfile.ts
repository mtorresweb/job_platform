import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { User, ProfileUpdateData } from "@/shared/types";

interface ApiError {
  response?: {
    data?: {
      error?: string;
      details?: Array<{ message: string }>;
    };
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    ApiError,
    ProfileUpdateData,
    { previousUser: User | undefined }
  >({
    mutationFn: async (data) => {
      const response = await apiClient.patch<User>("/users/profile", data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Invalidate and refresh current user cache so the UI reflects changes
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.setQueryData(["currentUser"], updatedUser);
      toast.success("Perfil actualizado con éxito");
    },
    onError: (error) => {
      console.error("Error al actualizar el perfil:", error);

      if (error.response?.data?.details) {
        // Validation errors
        const validationErrors = error.response.data.details
          .map((err) => err.message)
          .join(", ");
        toast.error(`Error de validación: ${validationErrors}`);
      } else {
        toast.error(
          error.response?.data?.error || "Error al actualizar el perfil",
        );
      }
    },
  });
}
