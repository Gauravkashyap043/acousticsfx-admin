import { request } from '../lib/api';

/** Single spec row (label / value) */
export interface SubProductSpec {
  label: string;
  value: string;
}

/** Gallery slide (large + small image) */
export interface SubProductGallerySlide {
  large: string;
  small: string;
}

/** Gallery image (single image; UI derives large/small layout) */
export interface SubProductGalleryImage {
  url: string;
  alt?: string;
}

/** Single profile option in the \"Product Profiles\" section */
export interface SubProductProfile {
  id?: string;
  name: string;
  size?: string;
  description?: string;
  image?: string;
}

export interface SubProductProfilesSection {
  title?: string;
  description?: string;
  profiles?: SubProductProfile[];
}

export interface SubProductSubstrateItem {
  name: string;
  thickness?: string;
  description?: string;
  image?: string;
}

export interface SubProductSubstratesSection {
  title?: string;
  description?: string;
  items?: SubProductSubstrateItem[];
}

export interface SubProductAboutTab {
  key: string;
  title: string;
  rows: string[];
}

export interface SubProductCertification {
  name: string;
  image: string;
  description?: string;
}

export interface SubProductFinishShade {
  name: string;
  description?: string;
  image: string;
}

export interface SubProductFinishesSection {
  title?: string;
  description?: string;
  items?: SubProductFinishShade[];
}

/** Sub-product with full detail fields for product detail page */
export interface SubProduct {
  /** Stable id for admin references (string ObjectId) */
  id?: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  /** If true, show "™" after title on the frontend (trademark registered) */
  showTrademark?: boolean;
  specDescription?: string;
  specs?: SubProductSpec[];
  /** Deprecated: old shape. Still optional for compatibility. */
  gallerySlides?: SubProductGallerySlide[];
  /** Preferred */
  galleryImages?: SubProductGalleryImage[];
  profilesSection?: SubProductProfilesSection;
  substratesSection?: SubProductSubstratesSection;
  aboutTabs?: SubProductAboutTab[];
  certifications?: SubProductCertification[];
  finishesSection?: SubProductFinishesSection;
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
  panelsSectionTitle?: string;
  panelsSectionDescription?: string;
  shortDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  items: ProductItem[];
}

export type CreateProductBody = {
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
  shortDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type UpdateProductBody = CreateProductBody;

export function listProducts(): Promise<ProductListResponse> {
  return request<ProductListResponse>('/api/admin/products');
}

export function createProduct(body: CreateProductBody): Promise<ProductItem> {
  return request<ProductItem>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateProduct(id: string, body: UpdateProductBody): Promise<ProductItem> {
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
