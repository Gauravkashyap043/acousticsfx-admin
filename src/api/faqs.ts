import { request } from '../lib/api';

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  order?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqListResponse {
  items: FaqItem[];
}

export function listFaqs(): Promise<FaqListResponse> {
  return request<FaqListResponse>('/api/admin/faqs');
}

export function createFaq(body: {
  question: string;
  answer: string;
  order?: number;
  isPublished?: boolean;
}): Promise<FaqItem> {
  return request<FaqItem>('/api/admin/faqs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateFaq(
  id: string,
  body: { question: string; answer: string; order?: number; isPublished?: boolean }
): Promise<FaqItem> {
  return request<FaqItem>(`/api/admin/faqs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteFaq(id: string): Promise<void> {
  return request<void>(`/api/admin/faqs/${id}`, {
    method: 'DELETE',
  });
}
