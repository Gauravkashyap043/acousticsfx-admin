import { request } from '../lib/api';

export interface ContactSubmissionItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface ContactSubmissionsListResponse {
  items: ContactSubmissionItem[];
}

export function listContactSubmissions(): Promise<ContactSubmissionsListResponse> {
  return request<ContactSubmissionsListResponse>('/api/admin/contact-submissions');
}
