// API Configuration and Constants
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
  },
  
  // Users & Professionals
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    PROFESSIONALS: '/users/professionals',
    VERIFY: '/users/verify',
  },
  
  // Services
  SERVICES: {
    BASE: '/services',
    CATEGORIES: '/services/categories',
    SEARCH: '/services/search',
    FEATURED: '/services/featured',
    BY_PROFESSIONAL: '/services/professional',
  },
  
  // Bookings
  BOOKINGS: {
    BASE: '/bookings',
    CREATE: '/bookings/create',
    UPDATE: '/bookings/update',
    CANCEL: '/bookings/cancel',
    CONFIRM: '/bookings/confirm',
    COMPLETE: '/bookings/complete',
    USER_BOOKINGS: '/bookings/user',
    PROFESSIONAL_BOOKINGS: '/bookings/professional',
  },
  
  // Reviews
  REVIEWS: {
    BASE: '/reviews',
    CREATE: '/reviews/create',
    UPDATE: '/reviews/update',
    SERVICE_REVIEWS: '/reviews/service',
    PROFESSIONAL_REVIEWS: '/reviews/professional',
  },
  
  // Messages
  MESSAGES: {
    BASE: '/messages',
    CONVERSATIONS: '/messages/conversations',
    SEND: '/messages/send',
    MARK_READ: '/messages/mark-read',
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: '/notifications/mark-read',
    MARK_ALL_READ: '/notifications/mark-all-read',
    SETTINGS: '/notifications/settings',
  },
  
  // Analytics
  ANALYTICS: {
    BASE: '/analytics',
    DASHBOARD: '/analytics/dashboard',
    PROFESSIONAL: '/analytics/professional',
    BOOKINGS: '/analytics/bookings',
    REVENUE: '/analytics/revenue',
  },
  
  // File Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    AVATAR: '/upload/avatar',
  },
  
  // Search
  SEARCH: {
    GLOBAL: '/search',
    SERVICES: '/search/services',
    PROFESSIONALS: '/search/professionals',
    SUGGESTIONS: '/search/suggestions',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_ERRORS = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
} as const;
