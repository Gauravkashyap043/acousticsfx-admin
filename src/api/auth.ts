import { request } from '../lib/api';

export interface LoginResponse {
  token: string;
  admin: { id: string; email: string };
}

export interface MeResponse {
  admin: { id: string; email: string };
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function me(): Promise<MeResponse> {
  return request<MeResponse>('/api/auth/me');
}
