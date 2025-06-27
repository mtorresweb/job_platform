export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: string;
  priority?: string;
  phone?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  phone?: string;
  status: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ContactSubmissionsResponse {
  success: boolean;
  submissions: ContactSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  id?: string;
  errors?: Array<{
    code: string;
    message: string;
    path: (string | number)[];
  }>;
}

// Submit contact form
export async function submitContactForm(data: ContactFormData): Promise<ContactFormResponse> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Get contact submissions (admin only)
export async function getContactSubmissions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}): Promise<ContactSubmissionsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.status) searchParams.set("status", params.status);
  if (params?.category) searchParams.set("category", params.category);

  const response = await fetch(`/api/contact?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Types for category and priority options
export const CONTACT_CATEGORIES = [
  { value: "general", label: "Consulta General" },
  { value: "technical", label: "Problema Técnico" },
  { value: "billing", label: "Facturación" },
  { value: "feedback", label: "Comentarios" },
  { value: "report", label: "Reportar Problema" },
] as const;

export const CONTACT_PRIORITIES = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
] as const;

export type ContactCategory = typeof CONTACT_CATEGORIES[number]["value"];
export type ContactPriority = typeof CONTACT_PRIORITIES[number]["value"];
