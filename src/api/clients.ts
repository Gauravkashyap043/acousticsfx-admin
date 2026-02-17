import { request } from '../lib/api';

export interface ClientItem {
  _id: string;
  name: string;
  logo: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientListResponse {
  items: ClientItem[];
}

export function listClients(): Promise<ClientListResponse> {
  return request<ClientListResponse>('/api/admin/clients');
}

export function createClient(body: {
  name: string;
  logo: string;
  order?: number;
}): Promise<ClientItem> {
  return request<ClientItem>('/api/admin/clients', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateClient(
  id: string,
  body: { name: string; logo: string; order?: number }
): Promise<ClientItem> {
  return request<ClientItem>(`/api/admin/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteClient(id: string): Promise<void> {
  return request<void>(`/api/admin/clients/${id}`, {
    method: 'DELETE',
  });
}
