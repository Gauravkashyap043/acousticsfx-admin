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
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function listAdmins(params?: { page?: number; limit?: number }): Promise<AdminsListResponse> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set('page', String(params.page));
  if (params?.limit != null) sp.set('limit', String(params.limit));
  const qs = sp.toString();
  return request<AdminsListResponse>(`/api/admin/admins${qs ? `?${qs}` : ''}`);
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
