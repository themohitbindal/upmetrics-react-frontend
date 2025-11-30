/**
 * API Endpoints Constants
 * Matches backend API structure from API_INTEGRATION_PROMPT.md
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const API_ENDPOINTS = {
  // Auth endpoints (Public - No Token Required)
  AUTH: {
    SIGNUP: '/api/auth/signup',
    SIGNIN: '/api/auth/signin',
    RESET_PASSWORD: '/api/auth/reset-password',
  },

  // User endpoints (Protected - Token Required)
  USER: {
    BY_ID: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
  },

  // Task endpoints (Protected - Token Required)
  TASKS: {
    BASE: '/api/tasks',
    BY_ID: (id: string) => `/api/tasks/${id}`,
    BY_CATEGORY: (categoryId: string) => `/api/tasks?categoryId=${categoryId}`,
  },

  // Category endpoints (Protected - Token Required)
  CATEGORIES: {
    BASE: '/api/categories',
  },
} as const

export { API_BASE_URL }

