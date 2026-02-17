import { request } from '../lib/api';

export interface TestimonialItem {
  _id: string;
  company: string;
  companyLogo: string;
  text: string;
  name: string;
  role: string;
  avatar: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestimonialListResponse {
  items: TestimonialItem[];
}

export function listTestimonials(): Promise<TestimonialListResponse> {
  return request<TestimonialListResponse>('/api/admin/testimonials');
}

export function createTestimonial(body: {
  company: string;
  companyLogo: string;
  text: string;
  name: string;
  role: string;
  avatar: string;
  order?: number;
}): Promise<TestimonialItem> {
  return request<TestimonialItem>('/api/admin/testimonials', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateTestimonial(
  id: string,
  body: {
    company: string;
    companyLogo: string;
    text: string;
    name: string;
    role: string;
    avatar: string;
    order?: number;
  }
): Promise<TestimonialItem> {
  return request<TestimonialItem>(`/api/admin/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteTestimonial(id: string): Promise<void> {
  return request<void>(`/api/admin/testimonials/${id}`, {
    method: 'DELETE',
  });
}
