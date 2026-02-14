import { request } from '../lib/api';

export interface EventItem {
  _id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  eventDate?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventListResponse {
  items: EventItem[];
}

export function listEvents(): Promise<EventListResponse> {
  return request<EventListResponse>('/api/admin/events');
}

export function createEvent(body: {
  slug: string;
  title: string;
  description: string;
  image: string;
  eventDate?: string;
  location?: string;
}): Promise<EventItem> {
  return request<EventItem>('/api/admin/events', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateEvent(
  id: string,
  body: {
    slug: string;
    title: string;
    description: string;
    image: string;
    eventDate?: string;
    location?: string;
  }
): Promise<EventItem> {
  return request<EventItem>(`/api/admin/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteEvent(id: string): Promise<void> {
  return request<void>(`/api/admin/events/${id}`, { method: 'DELETE' });
}
