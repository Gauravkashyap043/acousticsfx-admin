import { request } from '../lib/api';

export interface FooterLinkItem {
  _id: string;
  section: 'services' | 'resources';
  label: string;
  href?: string;
  order?: number;
}

export function listFooterLinks(): Promise<{ items: FooterLinkItem[] }> {
  return request<{ items: FooterLinkItem[] }>('/api/admin/footer-links');
}

export function createFooterLink(body: Omit<FooterLinkItem, '_id'>): Promise<FooterLinkItem> {
  return request<FooterLinkItem>('/api/admin/footer-links', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateFooterLink(id: string, body: Omit<FooterLinkItem, '_id'>): Promise<FooterLinkItem> {
  return request<FooterLinkItem>(`/api/admin/footer-links/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteFooterLink(id: string): Promise<void> {
  return request<void>(`/api/admin/footer-links/${id}`, { method: 'DELETE' });
}
