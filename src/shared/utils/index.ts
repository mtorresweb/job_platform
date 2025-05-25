// ==========================================
// UTILIDADES COMPARTIDAS
// ==========================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MESSAGES, PRICE_CONFIG } from "../constants";

// ==========================================
// UTILIDADES DE UI
// ==========================================

/**
 * Combina clases de Tailwind CSS de manera eficiente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera iniciales a partir de un nombre
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Trunca texto con ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// ==========================================
// UTILIDADES DE FORMATO
// ==========================================

/**
 * Formatea precio en pesos colombianos
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea número con separadores de miles
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-CO").format(num);
}

/**
 * Formatea fecha relativa (hace X tiempo)
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const diffInSeconds = Math.floor(
    (now.getTime() - targetDate.getTime()) / 1000,
  );

  if (diffInSeconds < 60) return "hace un momento";
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400)
    return `hace ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 2592000)
    return `hace ${Math.floor(diffInSeconds / 86400)} días`;

  return targetDate.toLocaleDateString("es-CO");
}

/**
 * Formatea fecha completa
 */
export function formatDate(date: Date | string, includeTime = false): string {
  const targetDate = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return targetDate.toLocaleDateString("es-CO", options);
}

/**
 * Formatea duración en minutos a formato legible
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours} h`;
  return `${hours}h ${remainingMinutes}m`;
}

// ==========================================
// UTILIDADES DE VALIDACIÓN
// ==========================================

/**
 * Valida email básico
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida teléfono colombiano
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
}

/**
 * Valida que la contraseña sea segura
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Debe tener al menos 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Debe tener al menos una mayúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Debe tener al menos una minúscula");
  }

  if (!/\d/.test(password)) {
    errors.push("Debe tener al menos un número");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Debe tener al menos un carácter especial (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==========================================
// UTILIDADES DE STRING
// ==========================================

/**
 * Convierte texto a slug URL-friendly
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remueve acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remueve caracteres especiales
    .trim()
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-"); // Múltiples guiones a uno solo
}

/**
 * Capitaliza primera letra
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitaliza cada palabra
 */
export function capitalizeWords(text: string): string {
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

// ==========================================
// UTILIDADES DE ARCHIVOS
// ==========================================

/**
 * Convierte bytes a formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Obtiene extensión de archivo
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Valida tipo de archivo
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  return validTypes.includes(file.type);
}

// ==========================================
// UTILIDADES DE URL Y RUTAS
// ==========================================

/**
 * Genera URL absoluta
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Extrae parámetros de búsqueda de URL
 */
export function getSearchParams(url: string): Record<string, string> {
  const searchParams = new URL(url).searchParams;
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// ==========================================
// UTILIDADES DE ARRAYS Y OBJETOS
// ==========================================

/**
 * Elimina elementos duplicados de un array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Agrupa array por una propiedad
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K,
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Ordena array por múltiples criterios
 */
export function sortBy<T>(
  array: T[],
  ...sortKeys: Array<keyof T | ((item: T) => unknown)>
): T[] {
  return [...array].sort((a, b) => {
    for (const key of sortKeys) {
      let aVal: unknown;
      let bVal: unknown;

      if (typeof key === "function") {
        aVal = key(a);
        bVal = key(b);
      } else {
        aVal = a[key];
        bVal = b[key];
      }

      // Type-safe comparison
      if (typeof aVal === "string" && typeof bVal === "string") {
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      } else if (aVal != null && bVal != null) {
        const aStr = String(aVal);
        const bStr = String(bVal);
        if (aStr < bStr) return -1;
        if (aStr > bStr) return 1;
      }
    }
    return 0;
  });
}

// ==========================================
// UTILIDADES DE CÁLCULO
// ==========================================

/**
 * Calcula promedio de rating
 */
export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Redondea a 1 decimal
}

/**
 * Calcula comisión de la plataforma
 * NOTA: Actualmente 0% - Plataforma 100% gratuita
 */
export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PRICE_CONFIG.commissionRate); // Retorna 0
}

/**
 * Calcula monto final después de comisión
 * NOTA: Como no hay comisión, retorna el monto completo
 */
export function calculateFinalAmount(amount: number): number {
  return amount; // Sin comisión, el profesional recibe el 100%
}

// ==========================================
// UTILIDADES DE TIEMPO
// ==========================================

/**
 * Verifica si una fecha está en el pasado
 */
export function isPastDate(date: Date | string): boolean {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  return targetDate < new Date();
}

/**
 * Verifica si dos fechas son del mismo día
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Obtiene el inicio del día
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Obtiene el final del día
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

// ==========================================
// UTILIDADES DE ERROR
// ==========================================

/**
 * Convierte error a mensaje legible
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return MESSAGES.errors.generic;
}

/**
 * Verifica si es un error de red
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch")
    );
  }
  return false;
}

// ==========================================
// UTILIDADES DE DESARROLLO
// ==========================================

/**
 * Log condicional solo en desarrollo
 */
export function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
}

/**
 * Simula delay (útil para testing)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
