import { request } from '../lib/api';

export interface SubProduct {
  slug: string;
  title: string;
  description: string;
  image: string;
}

export interface ProductItem {
  _id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  heroImage?: string;
  subProducts: SubProduct[];
  categorySlug?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  items: ProductItem[];
}

export function listProducts(): Promise<ProductListResponse> {
  return request<ProductListResponse>('/api/admin/products');
}

export function createProduct(body: {
  slug: string;
  title: string;
  description: string;
  image: string;
  heroImage?: string;
  subProducts: SubProduct[];
  categorySlug?: string;
  order?: number;
}): Promise<ProductItem> {
  return request<ProductItem>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateProduct(
  id: string,
  body: {
    slug: string;
    title: string;
    description: string;
    image: string;
    heroImage?: string;
    subProducts: SubProduct[];
    categorySlug?: string;
    order?: number;
  }
): Promise<ProductItem> {
  return request<ProductItem>(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteProduct(id: string): Promise<void> {
  return request<void>(`/api/admin/products/${id}`, {
    method: 'DELETE',
  });
}
