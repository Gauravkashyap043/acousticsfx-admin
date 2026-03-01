import { request } from '../lib/api';

export interface SubProductGridIntro {
  title?: string;
  subtitle?: string;
  body?: string;
}

export interface SubProductGridImage {
  url: string;
  alt?: string;
}

export interface SubProductSpec {
  label: string;
  value: string;
}

export interface SubProductGallerySlide {
  large: string;
  small: string;
}

export interface SubProduct {
  slug: string;
  title: string;
  description: string;
  image: string;
  gridIntro?: SubProductGridIntro;
  gridImages?: SubProductGridImage[];
  specDescription?: string;
  specs?: SubProductSpec[];
  gallerySlides?: SubProductGallerySlide[];
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
  /** Heading for the "Our Acoustic Panels" section on the product page */
  panelsSectionTitle?: string;
  /** Body copy for that section */
  panelsSectionDescription?: string;
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
  panelsSectionTitle?: string;
  panelsSectionDescription?: string;
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
    panelsSectionTitle?: string;
    panelsSectionDescription?: string;
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
