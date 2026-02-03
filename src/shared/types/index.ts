/* eslint-disable @typescript-eslint/no-explicit-any */
// ==========================================
// TIPOS COMPARTIDOS DE LA APLICACIÓN
// ==========================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  profileCompleted: boolean;
  professional?: Professional;
  acceptedTermsAt?: Date;
  acceptedPrivacyAt?: Date;
  dataRetentionExpiry?: Date;
}

export enum UserRole {
  CLIENT = "CLIENT",
  PROFESSIONAL = "PROFESSIONAL",
  ADMIN = "ADMIN",
}

export interface Professional extends User {
  bio?: string;
  experience: number; // años de experiencia
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  specialties: string[];
  availability: Availability[];
  location: Location;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  duration: number; // en minutos
  professionalId: string;
  professional: Professional;
  images: string[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

export interface Booking {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledAt: Date;
  duration: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  client: User;
  professional: Professional;
  service: Service;
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  professionalId: string;
  rating: number; // 1-5
  comment?: string;
  response?: string; // respuesta del profesional
  createdAt: Date;
  updatedAt: Date;
  client: User;
  professional: Professional;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  createdAt: Date;
  sender: User;
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  SYSTEM = "SYSTEM",
}

export interface Conversation {
  id: string;
  clientId: string;
  professionalId: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  client: User;
  professional: Professional;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string; // ID relacionado (booking, message, etc.)
  createdAt: Date;
}

export enum NotificationType {
  BOOKING_REQUEST = "BOOKING_REQUEST",
  BOOKING_CONFIRMED = "BOOKING_CONFIRMED",
  BOOKING_CANCELLED = "BOOKING_CANCELLED",
  NEW_MESSAGE = "NEW_MESSAGE",
  NEW_REVIEW = "NEW_REVIEW",
  SERVICE_COMPLETED = "SERVICE_COMPLETED", // Reemplaza PAYMENT_RECEIVED
  SYSTEM = "SYSTEM",
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface Availability {
  dayOfWeek: number; // 0-6 (domingo-sábado)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

// ==========================================
// TIPOS PARA FORMULARIOS Y VALIDACIÓN
// ==========================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  acceptTerms: boolean;
}

export interface BaseProfileUpdateData {
  name: string;
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface ProfessionalProfileUpdateData extends BaseProfileUpdateData {
  bio: string;
  experience: number;
  specialties: string[];
}

export type ProfileUpdateData =
  | BaseProfileUpdateData
  | ProfessionalProfileUpdateData;

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface ServiceForm {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  duration: number;
  tags: string[];
}

export interface ProfileForm {
  name: string;
  bio?: string;
  specialties: string[];
  location: Partial<Location>;
}

// ==========================================
// TIPOS PARA FILTROS Y BÚSQUEDA
// ==========================================

export interface ServiceFilters {
  category?: string;
  rating?: number;
  location?: string;
  availability?: boolean;
  sortBy?: "rating" | "newest" | "popular";
  sortOrder?: "asc" | "desc";
}

export interface SearchParams {
  query?: string;
  filters?: ServiceFilters;
  page?: number;
  limit?: number;
}

// ==========================================
// TIPOS PARA RESPUESTAS DE API
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================================
// TIPOS PARA AUTENTICACIÓN
// ==========================================

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
