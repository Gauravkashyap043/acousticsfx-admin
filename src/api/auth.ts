import { request } from '../lib/api';

export interface AdminInfo {
  id: string;
  email: string;
  role?: string;
  allowedTabs: string[];
}

export interface LoginResponse {
  token: string;
  admin: AdminInfo;
}

export interface MeResponse {
  admin: AdminInfo;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signUp(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function me(): Promise<MeResponse> {
  return request<MeResponse>('/api/auth/me');
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return request<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return request<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}
