// API Client with error handling, retries, and authentication
import { API_CONFIG, API_ERRORS, HTTP_STATUS } from "@/shared/constants/api";

interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    // Use same-origin in the browser so session cookies are sent correctly
    this.baseURL =
      typeof window !== "undefined"
        ? `${window.location.origin}/api`
        : API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add authentication header if available in browser
    if (typeof window !== "undefined") {
      const hasLocalStorage =
        typeof localStorage === "object" &&
        typeof localStorage.getItem === "function";

      if (hasLocalStorage) {
        const token = localStorage.getItem("auth-token");
        if (token) {
          defaultHeaders.Authorization = `Bearer ${token}`;
          defaultHeaders["x-better-auth-token"] = token; // Add this for better-auth compatibility
        }
      }
    }

    const config: RequestInit = {
      credentials: "include", // ensure cookies (session) are sent
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(attempt * 1000);
        return this.makeRequest(endpoint, options, attempt + 1);
      }
      throw this.transformError(error);
    }
  }

  private async handleErrorResponse(response: Response): Promise<ApiError> {
    const error: ApiError = new Error();
    error.status = response.status;

    try {
      const errorData = await response.json();
      error.message = errorData.message || response.statusText;
      error.code = errorData.code;
      error.details = errorData.details;
    } catch {
      error.message = response.statusText;
    }

    switch (response.status) {
      case HTTP_STATUS.BAD_REQUEST:
        error.code = API_ERRORS.VALIDATION_ERROR;
        break;
      case HTTP_STATUS.UNAUTHORIZED:
      case HTTP_STATUS.FORBIDDEN:
        error.code = API_ERRORS.AUTH_ERROR;
        break;
      case HTTP_STATUS.NOT_FOUND:
        error.code = API_ERRORS.NOT_FOUND;
        break;
      default:
        error.code = API_ERRORS.SERVER_ERROR;
    }

    return error;
  }
  private transformError(error: unknown): ApiError {
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "AbortError"
    ) {
      const timeoutError: ApiError = new Error("Request timeout");
      timeoutError.code = API_ERRORS.TIMEOUT_ERROR;
      return timeoutError;
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      const networkError: ApiError = new Error("Network error");
      networkError.code = API_ERRORS.NETWORK_ERROR;
      return networkError;
    }

    return error as ApiError;
  }
  private shouldRetry(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;

    const apiError = error as ApiError;
    return (
      apiError.code === API_ERRORS.NETWORK_ERROR ||
      apiError.code === API_ERRORS.TIMEOUT_ERROR ||
      Boolean(apiError.status && apiError.status >= 500)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // HTTP Methods
  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    const search = params
      ? Object.entries(params)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
          .join('&')
      : '';

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullPath = search ? `${path}?${search}` : path;

    return this.makeRequest(fullPath);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: "DELETE",
    });
  }

  // File upload with multipart/form-data
  async upload<T>(
    endpoint: string,
    formData: FormData,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Type-safe API hooks for common operations
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, unknown>;
}

// Error boundary for API errors
export function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      "message" in error &&
      typeof (error as { code: unknown }).code === "string" &&
      typeof (error as { message: unknown }).message === "string",
  );
}
