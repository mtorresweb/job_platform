import { useMutation } from "@tanstack/react-query";
import { submitContactForm, ContactFormData, ContactFormResponse } from "../utils/contact-api";
import { toast } from "sonner";

export function useSubmitContactForm() {
  return useMutation<ContactFormResponse, Error, ContactFormData>({
    mutationFn: submitContactForm,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Mensaje enviado correctamente", {
          description: "Te responderemos lo antes posible."
        });
      } else {
        toast.error("Error al enviar el mensaje", {
          description: data.message || "Inténtalo de nuevo más tarde."
        });
      }
    },
    onError: (error) => {
      console.error("Contact form submission error:", error);
      toast.error("Error al enviar el mensaje", {
        description: "Verifica tu conexión e inténtalo de nuevo."
      });
    },
  });
}
