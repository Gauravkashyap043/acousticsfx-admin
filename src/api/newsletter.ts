import { request } from '../lib/api';

export interface NewsletterSubscriptionItem {
  _id: string;
  email: string;
  createdAt: string;
}

export interface NewsletterSubscriptionsListResponse {
  items: NewsletterSubscriptionItem[];
}

export function listNewsletterSubscriptions(): Promise<NewsletterSubscriptionsListResponse> {
  return request<NewsletterSubscriptionsListResponse>('/api/admin/newsletter-subscriptions');
}
