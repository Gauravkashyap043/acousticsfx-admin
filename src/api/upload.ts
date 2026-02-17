import { getToken } from '../lib/api';

const getBaseUrl = () => import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export interface UploadImageResponse {
  url: string;
}

/** Upload a image file; returns the ImageKit URL. Auth required. */
export async function uploadImage(file: File): Promise<UploadImageResponse> {
  const url = `${getBaseUrl()}/api/admin/upload-image`;
  const token = getToken();
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (body as { error?: string }).error ?? res.statusText;
    throw new Error(message);
  }
  return body as UploadImageResponse;
}
