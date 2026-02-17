import { request } from '../lib/api';

export interface TrustedPartnerItem {
  _id: string;
  name: string;
  logo: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrustedPartnerListResponse {
  items: TrustedPartnerItem[];
}

export function listTrustedPartners(): Promise<TrustedPartnerListResponse> {
  return request<TrustedPartnerListResponse>('/api/admin/trusted-partners');
}

export function createTrustedPartner(body: {
  name: string;
  logo: string;
  order?: number;
}): Promise<TrustedPartnerItem> {
  return request<TrustedPartnerItem>('/api/admin/trusted-partners', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateTrustedPartner(
  id: string,
  body: { name: string; logo: string; order?: number }
): Promise<TrustedPartnerItem> {
  return request<TrustedPartnerItem>(`/api/admin/trusted-partners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteTrustedPartner(id: string): Promise<void> {
  return request<void>(`/api/admin/trusted-partners/${id}`, {
    method: 'DELETE',
  });
}
