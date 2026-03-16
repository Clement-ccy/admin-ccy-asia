import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const normalizeBaseUrl = (value: string) => {
  if (!value) return '';
  const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

const LOCAL_API_PATTERN = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/;

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? '');

  if (configuredBaseUrl && process.env.NODE_ENV !== 'production' && LOCAL_API_PATTERN.test(configuredBaseUrl)) {
    return '/api';
  }

  return configuredBaseUrl || 'https://api.ccy.asia';
};

export const API_BASE_URL = resolveApiBaseUrl();

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
