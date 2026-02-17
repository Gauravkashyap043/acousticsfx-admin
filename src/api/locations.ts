import { request } from '../lib/api';

export interface LocationItem {
  _id: string;
  title: string;
  highlight?: boolean;
  items: { label: string; value: string }[];
  order?: number;
}

export function listLocations(): Promise<{ items: LocationItem[] }> {
  return request<{ items: LocationItem[] }>('/api/admin/locations');
}

export function createLocation(body: Omit<LocationItem, '_id'>): Promise<LocationItem> {
  return request<LocationItem>('/api/admin/locations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateLocation(id: string, body: Omit<LocationItem, '_id'>): Promise<LocationItem> {
  return request<LocationItem>(`/api/admin/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteLocation(id: string): Promise<void> {
  return request<void>(`/api/admin/locations/${id}`, { method: 'DELETE' });
}
