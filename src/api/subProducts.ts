import { request } from '../lib/api';
import type {
  SubProduct,
  SubProductSpec,
  SubProductGallerySlide,
  SubProductGalleryImage,
  SubProductProfilesSection,
  SubProductSubstratesSection,
  SubProductAboutTab,
  SubProductCertification,
  SubProductFinishesSection,
} from './products';

export type {
  SubProduct,
  SubProductSpec,
  SubProductGallerySlide,
  SubProductGalleryImage,
  SubProductProfilesSection,
  SubProductSubstratesSection,
  SubProductAboutTab,
  SubProductCertification,
  SubProductFinishesSection,
};

export interface SubProductListItem {
  productId: string;
  productSlug: string;
  productTitle: string;
  categorySlug?: string;
  subProduct: SubProduct;
}

export interface SubProductListResponse {
  items: SubProductListItem[];
}

export function listSubProducts(): Promise<SubProductListResponse> {
  return request<SubProductListResponse>('/api/admin/sub-products');
}

export function createSubProduct(productId: string, body: SubProduct): Promise<{ productId: string; subProduct: SubProduct }> {
  return request<{ productId: string; subProduct: SubProduct }>(`/api/admin/products/${productId}/sub-products`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateSubProduct(
  productId: string,
  currentSlug: string,
  body: SubProduct
): Promise<{ productId: string; subProduct: SubProduct }> {
  return request<{ productId: string; subProduct: SubProduct }>(
    `/api/admin/products/${encodeURIComponent(productId)}/sub-products/${encodeURIComponent(currentSlug)}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    }
  );
}

export function deleteSubProduct(productId: string, slug: string): Promise<void> {
  return request<void>(
    `/api/admin/products/${encodeURIComponent(productId)}/sub-products/${encodeURIComponent(slug)}`,
    { method: 'DELETE' }
  );
}
