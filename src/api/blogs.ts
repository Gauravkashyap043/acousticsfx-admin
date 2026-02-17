import { request } from '../lib/api';

export interface BlogItem {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  heroImage: string;
  authorName: string;
  authorImage?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogListResponse {
  items: BlogItem[];
}

export function listBlogs(): Promise<BlogListResponse> {
  return request<BlogListResponse>('/api/admin/blogs');
}

export function createBlog(body: {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  heroImage: string;
  authorName: string;
  authorImage?: string;
  tags?: string[];
  publishedAt?: string;
}): Promise<BlogItem> {
  return request<BlogItem>('/api/admin/blogs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateBlog(
  id: string,
  body: {
    slug: string;
    title: string;
    excerpt?: string;
    content?: string;
    heroImage: string;
    authorName: string;
    authorImage?: string;
    tags?: string[];
    publishedAt?: string;
  }
): Promise<BlogItem> {
  return request<BlogItem>(`/api/admin/blogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteBlog(id: string): Promise<void> {
  return request<void>(`/api/admin/blogs/${id}`, { method: 'DELETE' });
}
