import { request } from '../lib/api';

export interface CategoryItem {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryListResponse {
  items: CategoryItem[];
}

export function listCategories(): Promise<CategoryListResponse> {
  return request<CategoryListResponse>('/api/admin/categories');
}

export function createCategory(body: {
  slug: string;
  name: string;
  description?: string;
  image?: string;
  order?: number;
}): Promise<CategoryItem> {
  return request<CategoryItem>('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateCategory(
  id: string,
  body: {
    slug: string;
    name: string;
    description?: string;
    image?: string;
    order?: number;
  }
): Promise<CategoryItem> {
  return request<CategoryItem>(`/api/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteCategory(id: string): Promise<void> {
  return request<void>(`/api/admin/categories/${id}`, {
    method: 'DELETE',
  });
}
