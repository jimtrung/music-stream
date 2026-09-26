import type { AxiosError } from 'axios';

/**
 * Error types for authentication-related errors
 */
export const AUTH_ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNKNOWN: 'UNKNOWN',
} as const;

export type AuthErrorType = typeof AUTH_ERROR_TYPES[keyof typeof AUTH_ERROR_TYPES];

export interface NormalizedAuthError {
  type: AuthErrorType;
  message: string;
  field?: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  code?: string;
  field?: string;
}

/**
 * Normalize authentication errors from API responses
 */
export const normalizeAuthError = (error: AxiosError<ApiErrorResponse>): NormalizedAuthError => {
  // Network error (no response)
  if (!error.response) {
    return {
      type: AUTH_ERROR_TYPES.NETWORK,
      message: 'Cannot connect to server. Please check your internet connection.',
    };
  }

  const { status, data } = error.response;
  const serverMessage = data?.message || data?.error;

  // Handle specific error codes from backend
  if (data?.code) {
    switch (data.code) {
      case 'EMAIL_NOT_VERIFIED':
        return {
          type: AUTH_ERROR_TYPES.EMAIL_NOT_VERIFIED,
          message: serverMessage || 'Please verify your email before signing in.',
        };
      case 'EMAIL_ALREADY_EXISTS':
        return {
          type: AUTH_ERROR_TYPES.EMAIL_ALREADY_EXISTS,
          message: serverMessage || 'An account with this email already exists.',
          field: 'email',
        };
      case 'INVALID_TOKEN':
        return {
          type: AUTH_ERROR_TYPES.INVALID_TOKEN,
          message: serverMessage || 'Invalid verification code.',
        };
      case 'TOKEN_EXPIRED':
        return {
          type: AUTH_ERROR_TYPES.TOKEN_EXPIRED,
          message: serverMessage || 'Verification code has expired. Please request a new one.',
        };
    }
  }

  // Handle by HTTP status
  switch (status) {
    case 400:
      return {
        type: AUTH_ERROR_TYPES.VALIDATION,
        message: serverMessage || 'Invalid input. Please check your details.',
        field: data?.field,
      };
    case 401:
      return {
        type: AUTH_ERROR_TYPES.UNAUTHORIZED,
        message: serverMessage || 'Incorrect email or password.',
      };
    case 403:
      return {
        type: AUTH_ERROR_TYPES.FORBIDDEN,
        message: serverMessage || 'Access denied.',
      };
    case 404:
      return {
        type: AUTH_ERROR_TYPES.NOT_FOUND,
        message: serverMessage || 'Account not found.',
      };
    case 409:
      return {
        type: AUTH_ERROR_TYPES.EMAIL_ALREADY_EXISTS,
        message: serverMessage || 'An account with this email already exists.',
        field: 'email',
      };
    case 422:
      return {
        type: AUTH_ERROR_TYPES.VALIDATION,
        message: serverMessage || 'Please check your input and try again.',
        field: data?.field,
      };
    case 429:
      return {
        type: AUTH_ERROR_TYPES.VALIDATION,
        message: 'Too many attempts. Please try again later.',
      };
    case 500:
    case 502:
    case 503:
      return {
        type: AUTH_ERROR_TYPES.SERVER,
        message: 'Server is temporarily unavailable. Please try again later.',
      };
    default:
      return {
        type: AUTH_ERROR_TYPES.UNKNOWN,
        message: serverMessage || 'Something went wrong. Please try again.',
      };
  }
};

/**
 * Check if error requires user to re-authenticate
 */
export const requiresReauth = (normalizedError: NormalizedAuthError): boolean => {
  const reauthTypes: AuthErrorType[] = [
    AUTH_ERROR_TYPES.UNAUTHORIZED,
    AUTH_ERROR_TYPES.INVALID_TOKEN,
    AUTH_ERROR_TYPES.TOKEN_EXPIRED,
  ];
  return reauthTypes.includes(normalizedError.type);
};

/**
 * Check if error is a network/connectivity issue
 */
export const isNetworkError = (normalizedError: NormalizedAuthError): boolean => {
  return normalizedError.type === AUTH_ERROR_TYPES.NETWORK;
};

/**
 * Check if error should show as global (full-screen) error
 */
export const isGlobalError = (normalizedError: NormalizedAuthError): boolean => {
  const globalTypes: AuthErrorType[] = [
    AUTH_ERROR_TYPES.NETWORK,
    AUTH_ERROR_TYPES.SERVER,
  ];
  return globalTypes.includes(normalizedError.type);
};
