import { request } from '../lib/api';

export interface AdminItem {
  id: string;
  email: string;
  role: string;
  visibleTabs?: string[];
}

export interface AdminsListResponse {
  admins: AdminItem[];
  tabKeys: string[];
}

export function listAdmins(): Promise<AdminsListResponse> {
  return request<AdminsListResponse>('/api/admin/admins');
}

export function createAdmin(body: {
  email: string;
  password: string;
  role?: string;
  visibleTabs?: string[];
}): Promise<{ admin: AdminItem }> {
  return request<{ admin: AdminItem }>('/api/admin/admins', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAdmin(
  id: string,
  body: { role?: string; visibleTabs?: string[] }
): Promise<{ admin: AdminItem }> {
  return request<{ admin: AdminItem }>(`/api/admin/admins/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteAdmin(id: string): Promise<void> {
  return request<void>(`/api/admin/admins/${id}`, {
    method: 'DELETE',
  });
}
